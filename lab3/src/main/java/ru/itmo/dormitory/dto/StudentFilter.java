package ru.itmo.dormitory.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.QueryParam;

/**
 * параметры поиска, фильтрации, сортировки и пагинации
 * для GET приходят из query-параметров (@QueryParam),
 * для метода QUERY из JSON-тела (те же имена полей)
 */
public class StudentFilter {

    // ---- поиск ----
    @QueryParam("fullName")
    @Size(min = 1, max = 135, message = "Строка поиска от 1 до 135 символов")
    public String fullName;

    // ---- фильтры ----
    @QueryParam("group")
    @Pattern(regexp = StudentRequest.GROUP_REGEX, message = "Группа должна быть в формате P3210")
    public String group;

    @QueryParam("isuId")
    @Min(value = 100000, message = "Номер ИСУ — шестизначное число")
    @Max(value = 999999, message = "Номер ИСУ — шестизначное число")
    public Integer isuId;

    @QueryParam("hasDormitory")
    public Boolean hasDormitory;

    @QueryParam("dormitory")
    @Min(value = 1, message = "Номер общежития от 1 до 999")
    @Max(value = 999, message = "Номер общежития от 1 до 999")
    public Integer dormitory;

    @QueryParam("room")
    @Min(value = 1, message = "Номер комнаты от 1 до 9999")
    @Max(value = 9999, message = "Номер комнаты от 1 до 9999")
    public Integer room;

    // строкой, так как JAX-RS не умеет сам превращать query-параметр в LocalDate
    @QueryParam("settlementPeriod")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Дата в формате ГГГГ-ММ-ДД")
    public String settlementPeriod;

    @QueryParam("isForeign")
    public Boolean isForeign;

    // ---- сортировка ----
    @QueryParam("sort")
    @NotNull(message = "Поле sort не может быть null")
    @DefaultValue("fullName")
    @Pattern(regexp = "fullName|group|isuId|dormitory|room|settlementPeriod",
            message = "Сортировать можно по: fullName, group, isuId, dormitory, room, settlementPeriod")
    public String sort = "fullName";

    @QueryParam("order")
    @NotNull(message = "Поле order не может быть null")
    @DefaultValue("asc")
    @Pattern(regexp = "asc|desc", message = "Порядок сортировки: asc или desc")
    public String order = "asc";

    // ---- пагинация ----
    @QueryParam("page")
    @NotNull(message = "Поле page не может быть null")
    @DefaultValue("1")
    @Min(value = 1, message = "Номер страницы начинается с 1")
    public Integer page = 1;

    @QueryParam("size")
    @NotNull(message = "Поле size не может быть null")
    @DefaultValue("10")
    @Min(value = 1, message = "Размер страницы от 1 до 100")
    @Max(value = 100, message = "Размер страницы от 1 до 100")
    public Integer size = 10;
}
