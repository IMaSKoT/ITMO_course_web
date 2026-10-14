package ru.itmo.dormitory.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.QueryParam;

// для GET приходит из query-параметров, для QUERY из JSON-тела с теми же именами полей
public class StudentFilter {

    @QueryParam("fullName")
    @Size(min = 1, max = 135, message = "Строка поиска от 1 до 135 символов")
    public String fullName;

    @QueryParam("group")
    @Pattern(regexp = StudentRequest.GROUP_REGEX, message = StudentRequest.GROUP_MESSAGE)
    public String group;

    @QueryParam("isuId")
    @Min(value = 100000, message = StudentRequest.ISU_MESSAGE)
    @Max(value = 999999, message = StudentRequest.ISU_MESSAGE)
    public Integer isuId;

    @QueryParam("hasDormitory")
    public Boolean hasDormitory;

    @QueryParam("dormitory")
    @Min(value = 1, message = StudentRequest.DORMITORY_MESSAGE)
    @Max(value = 999, message = StudentRequest.DORMITORY_MESSAGE)
    public Integer dormitory;

    @QueryParam("room")
    @Min(value = 1, message = StudentRequest.ROOM_MESSAGE)
    @Max(value = 9999, message = StudentRequest.ROOM_MESSAGE)
    public Integer room;

    // строкой, потому что JAX-RS не умеет сам разбирать LocalDate из query-параметра
    @QueryParam("settlementPeriod")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Дата в формате ГГГГ-ММ-ДД")
    public String settlementPeriod;

    @QueryParam("isForeign")
    public Boolean isForeign;

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
