package ru.itmo.dormitory.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.Set;

// тело POST и PUT, правила те же, что в StudentCreateDTO из 2 лабы
public class StudentRequest {

    public static final String FULL_NAME_REGEX = "^[А-Яа-яЁё-]{2,43} [А-Яа-яЁё-]{2,45}(?: [А-Яа-яЁё]{2,45})?$";
    public static final String GROUP_REGEX = "^[A-Z][1-9][0-9]{3}$";

    static final String GROUP_MESSAGE = "Группа должна быть в формате P3210";
    static final String ISU_MESSAGE = "Номер ИСУ должен быть шестизначным числом";
    static final String DORMITORY_MESSAGE = "Номер общежития от 1 до 999";
    static final String ROOM_MESSAGE = "Номер комнаты от 1 до 9999";

    // по этому списку PATCH отсекает неизвестные поля
    public static final Set<String> FIELDS = Set.of(
            "fullName", "group", "isuId", "dormitory", "room", "settlementPeriod", "isForeign", "notes");

    @NotNull(message = "ФИО обязательно")
    @Pattern(regexp = FULL_NAME_REGEX,
            message = "ФИО: 2-3 слова кириллицей через пробел, например «Иванов Иван Иванович»")
    public String fullName;

    @NotNull(message = "Группа обязательна")
    @Pattern(regexp = GROUP_REGEX, message = GROUP_MESSAGE)
    public String group;

    @NotNull(message = "Номер ИСУ обязателен")
    @Min(value = 100000, message = ISU_MESSAGE)
    @Max(value = 999999, message = ISU_MESSAGE)
    public Integer isuId;

    @Min(value = 1, message = DORMITORY_MESSAGE)
    @Max(value = 999, message = DORMITORY_MESSAGE)
    public Integer dormitory;

    @Min(value = 1, message = ROOM_MESSAGE)
    @Max(value = 9999, message = ROOM_MESSAGE)
    public Integer room;

    // минимальную дату проверяет StudentService
    public LocalDate settlementPeriod;

    public boolean isForeign;

    @Size(max = 1000, message = "Заметка не длиннее 1000 символов")
    public String notes;
}
