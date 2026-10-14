package ru.itmo.dormitory.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.Set;

/**
 * тело запроса для создания (POST) и полной замены (PUT) студента
 * правила валидации те же, что были в StudentCreateDTO во 2-й лабе
 */
public class StudentRequest {

    public static final String FULL_NAME_REGEX =
            "^[А-Яа-яЁё-]{2,43} [А-Яа-яЁё-]{2,45}(?: [А-Яа-яЁё]{2,45})?$";
    public static final String GROUP_REGEX = "^[A-Z][1-9][0-9]{3}$";

    // какие поля вообще бывают у студента (нужно для проверки PATCH)
    public static final Set<String> FIELDS = Set.of(
            "fullName", "group", "isuId", "dormitory", "room",
            "settlementPeriod", "isForeign", "notes"
    );

    @NotNull(message = "ФИО обязательно")
    @Pattern(regexp = FULL_NAME_REGEX,
            message = "ФИО: 2-3 слова кириллицей через пробел, например «Иванов Иван Иванович»")
    public String fullName;

    @NotNull(message = "Группа обязательна")
    @Pattern(regexp = GROUP_REGEX, message = "Группа должна быть в формате P3210")
    public String group;

    @NotNull(message = "Номер ИСУ обязателен")
    @Min(value = 100000, message = "Номер ИСУ — шестизначное число")
    @Max(value = 999999, message = "Номер ИСУ — шестизначное число")
    public Integer isuId;

    @Min(value = 1, message = "Номер общежития от 1 до 999")
    @Max(value = 999, message = "Номер общежития от 1 до 999")
    public Integer dormitory;

    @Min(value = 1, message = "Номер комнаты от 1 до 9999")
    @Max(value = 9999, message = "Номер комнаты от 1 до 9999")
    public Integer room;

    // проверка "не раньше 2000-01-01" делается в StudentService
    public LocalDate settlementPeriod;

    public boolean isForeign;

    @Size(max = 1000, message = "Заметка не длиннее 1000 символов")
    public String notes;
}
