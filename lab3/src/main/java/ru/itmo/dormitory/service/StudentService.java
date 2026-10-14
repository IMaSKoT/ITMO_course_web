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

@ApplicationScoped
public class StudentService {

    private static final Logger LOG = Logger.getLogger(StudentService.class.getName());
    private static final Jsonb JSONB = JsonbBuilder.create();

    private static final LocalDate MIN_SETTLEMENT_DATE = LocalDate.of(2000, 1, 1);
    private static final String TOO_EARLY_DATE = "Дата заселения не может быть раньше 2000-01-01";

    @Inject
    private StudentRepository repository;

    @Inject
    private Validator validator;

    @Transactional
    public PageResponse<StudentResponse> getStudents(StudentFilter filter) {
        LocalDate settlementDate = parseDate(filter.settlementPeriod);
        List<StudentResponse> items = repository.findPage(filter, settlementDate).stream()
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
        checkDormitoryData(request);
        if (repository.existsByIsuId(request.isuId)) {
            throw duplicateIsu(request.isuId);
        }

        Student student = new Student();
        copyToEntity(request, student);
        repository.save(student);

        LOG.info("Created student isuId=" + student.getIsuId());
        return StudentResponse.from(student);
    }

    @Transactional
    public StudentResponse replace(int isuId, StudentRequest request) {
        Student student = findOrThrow(isuId);
        checkDormitoryData(request);
        if (request.isuId != isuId && repository.existsByIsuId(request.isuId)) {
            throw duplicateIsu(request.isuId);
        }

        copyToEntity(request, student);

        LOG.info("Updated student isuId=" + isuId);
        return StudentResponse.from(student);
    }

    @Transactional
    public StudentResponse patch(int isuId, JsonObject changes) {
        for (String field : changes.keySet()) {
            if (!StudentRequest.FIELDS.contains(field)) {
                throw ApiException.unprocessable("UNKNOWN_FIELD", "Неизвестное поле: " + field);
            }
        }

        JsonObject current = toJson(StudentResponse.from(findOrThrow(isuId)));
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

    private Student findOrThrow(int isuId) {
        return repository.findByIsuId(isuId).orElseThrow(() ->
                ApiException.notFound("STUDENT_NOT_FOUND", "Студент с ИСУ " + isuId + " не найден"));
    }

    private void checkDormitoryData(StudentRequest request) {
        boolean allSet = request.dormitory != null && request.room != null && request.settlementPeriod != null;
        boolean noneSet = request.dormitory == null && request.room == null && request.settlementPeriod == null;
        if (!allSet && !noneSet) {
            throw ApiException.unprocessable("INVALID_DORMITORY_DATA",
                    "Данные об общежитии должны быть заполнены полностью");
        }
        if (allSet && request.settlementPeriod.isBefore(MIN_SETTLEMENT_DATE)) {
            throw ApiException.unprocessable("INVALID_DORMITORY_DATA", TOO_EARLY_DATE);
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
            throw ApiException.unprocessable("VALIDATION_ERROR", TOO_EARLY_DATE);
        }
        return date;
    }

    private JsonObject toJson(Object dto) {
        return Json.createReader(new StringReader(JSONB.toJson(dto))).readObject();
    }

    private ApiException duplicateIsu(int isuId) {
        return ApiException.conflict("DUPLICATE_ISU", "Студент с ИСУ " + isuId + " уже существует");
    }
}
