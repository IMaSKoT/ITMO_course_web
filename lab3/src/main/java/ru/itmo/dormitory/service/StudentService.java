package ru.itmo.dormitory.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonValue;
import jakarta.json.bind.Jsonb;
import jakarta.json.bind.JsonbBuilder;
import jakarta.transaction.Transactional;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import ru.itmo.dormitory.dto.PageResponse;
import ru.itmo.dormitory.dto.StudentFilter;
import ru.itmo.dormitory.dto.StudentRequest;
import ru.itmo.dormitory.dto.StudentResponse;
import ru.itmo.dormitory.entity.Student;
import ru.itmo.dormitory.error.ApiException;
import ru.itmo.dormitory.repository.StudentRepository;

import java.io.StringReader;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Set;
import java.util.logging.Logger;

/** бизнес-логика работы со студентами (перенесена из service.py 2-й лабы) */
@ApplicationScoped
public class StudentService {

    private static final Logger LOG = Logger.getLogger(StudentService.class.getName());
    private static final LocalDate MIN_SETTLEMENT_DATE = LocalDate.of(2000, 1, 1);
    private static final Jsonb JSONB = JsonbBuilder.create();

    @Inject
    StudentRepository repository;

    @Inject
    Validator validator;

    @Transactional
    public PageResponse<StudentResponse> getStudents(StudentFilter filter) {
        LocalDate settlementDate = parseDate(filter.settlementPeriod);

        List<StudentResponse> items = repository.findPage(filter, settlementDate)
                .stream()
                .map(StudentResponse::from)
                .toList();
        long total = repository.countFiltered(filter, settlementDate);

        return new PageResponse<>(items, filter.page, filter.size, total);
    }

    @Transactional
    public StudentResponse getStudent(int isuId) {
        return StudentResponse.from(findOrThrow(isuId));
    }

    @Transactional
    public StudentResponse create(StudentRequest request) {
        validateBusinessRules(request);
        if (repository.existsByIsuId(request.isuId)) {
            throw duplicateIsu(request.isuId);
        }

        Student student = new Student();
        copyToEntity(request, student);
        repository.save(student);

        LOG.info("Created student isuId=" + student.getIsuId());
        return StudentResponse.from(student);
    }

    /** PUT: полная замена всех полей */
    @Transactional
    public StudentResponse replace(int isuId, StudentRequest request) {
        Student student = findOrThrow(isuId);
        validateBusinessRules(request);
        // если меняют номер ИСУ, новый не должен быть занят
        if (!request.isuId.equals(isuId) && repository.existsByIsuId(request.isuId)) {
            throw duplicateIsu(request.isuId);
        }

        copyToEntity(request, student);
        // save() не нужен: сущность управляемая, изменения уйдут в БД при коммите (dirty checking)

        LOG.info("Updated student isuId=" + isuId);
        return StudentResponse.from(student);
    }

    /**
     * PATCH: частичное изменение
     * как во 2-й лабе: берём текущие данные,
     * накладываем на них пришедшие поля (JSON Merge Patch, RFC 7396)
     * и проверяем результат целиком теми же правилами, что и при создании
     */
    @Transactional
    public StudentResponse patch(int isuId, JsonObject changes) {
        for (String key : changes.keySet()) {
            if (!StudentRequest.FIELDS.contains(key)) {
                throw ApiException.unprocessable("UNKNOWN_FIELD", "Неизвестное поле: " + key);
            }
        }

        Student student = findOrThrow(isuId);
        JsonObject current = toJsonObject(StudentResponse.from(student));
        JsonValue merged = Json.createMergePatch(changes).apply(current);
        StudentRequest request = JSONB.fromJson(merged.toString(), StudentRequest.class);

        Set<ConstraintViolation<StudentRequest>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }
        return replace(isuId, request);
    }

    @Transactional
    public void delete(int isuId) {
        repository.delete(findOrThrow(isuId));
        LOG.info("Deleted student isuId=" + isuId);
    }

    /** заполняет пустую таблицу начальными данными (вызывается из DataInitializer) */
    @Transactional
    public void importIfEmpty(List<StudentRequest> students) {
        if (repository.count() > 0) {
            return;
        }
        for (StudentRequest request : students) {
            Student student = new Student();
            copyToEntity(request, student);
            repository.save(student);
        }
        LOG.info("Imported " + students.size() + " students from seed file");
    }

    // ---------------- вспомогательные методы ----------------

    private Student findOrThrow(int isuId) {
        return repository.findByIsuId(isuId)
                .orElseThrow(() -> ApiException.notFound("STUDENT_NOT_FOUND",
                        "Студент с ИСУ " + isuId + " не найден"));
    }

    /** проверки, которые не выразить аннотациями на одном поле */
    private void validateBusinessRules(StudentRequest request) {
        // общежитие, комната и дата заселения заполняются либо все, либо никакие
        int filled = 0;
        if (request.dormitory != null) filled++;
        if (request.room != null) filled++;
        if (request.settlementPeriod != null) filled++;
        if (filled != 0 && filled != 3) {
            throw ApiException.unprocessable("INVALID_DORMITORY_DATA",
                    "Данные об общежитии должны быть заполнены полностью");
        }
        if (request.settlementPeriod != null && request.settlementPeriod.isBefore(MIN_SETTLEMENT_DATE)) {
            throw ApiException.unprocessable("INVALID_DORMITORY_DATA",
                    "Дата заселения не может быть раньше 2000-01-01");
        }
    }

    private void copyToEntity(StudentRequest request, Student student) {
        student.setFullName(request.fullName.trim());
        student.setGroupName(request.group);
        student.setIsuId(request.isuId);
        student.setDormitory(request.dormitory);
        student.setRoom(request.room);
        student.setSettlementPeriod(request.settlementPeriod);
        student.setForeign(request.isForeign);
        student.setNotes(request.notes);
    }

    private LocalDate parseDate(String value) {
        if (value == null) {
            return null;
        }
        LocalDate date;
        try {
            date = LocalDate.parse(value);
        } catch (DateTimeParseException e) {
            throw ApiException.unprocessable("VALIDATION_ERROR", "Некорректная дата: " + value);
        }
        if (date.isBefore(MIN_SETTLEMENT_DATE)) {
            throw ApiException.unprocessable("VALIDATION_ERROR", "Дата заселения не может быть раньше 2000-01-01");
        }
        return date;
    }

    private JsonObject toJsonObject(Object dto) {
        return Json.createReader(new StringReader(JSONB.toJson(dto))).readObject();
    }

    private ApiException duplicateIsu(int isuId) {
        return ApiException.conflict("DUPLICATE_ISU", "Студент с ИСУ " + isuId + " уже существует");
    }
}
