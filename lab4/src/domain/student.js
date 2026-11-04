const SURNAME_REGEX = /^[А-Яа-яЁё-]{2,43}$/;
const NAME_REGEX = /^[А-Яа-яЁё-]{2,45}$/;
const PATRONYMIC_REGEX = /^[А-Яа-яЁё]{2,45}$/;
const GROUP_REGEX = /^[A-Z][1-9][0-9]{3}$/;
const ISU_REGEX = /^[1-9][0-9]{5}$/;
const MIN_DATE = "2000-01-01";
const NOTES_MAX = 1000;
const SEARCH_MAX = 135;

const GROUP_ERROR = "Формат: латинская заглавная буква и 4 цифры, например P3210";
const ISU_ERROR = "6-значный номер, начинается не с 0";
const DORMITORY_ERROR = "Номер общежития от 1 до 999";
const ROOM_ERROR = "Номер комнаты от 1 до 9999";
const DATE_ERROR = "Дата заселения с 2000-01-01 и не в будущем";

const FILTER_NAMES = ["fullName", "group", "isuId", "hasDormitory", "dormitory", "room", "settlementPeriod", "isForeign", "notes"];

export const SORT_FIELDS = [
    {name: "fullName", label: "ФИО"},
    {name: "group", label: "Группа"},
    {name: "isuId", label: "ИСУ"},
    {name: "dormitory", label: "№ общежития"},
    {name: "room", label: "Комната"},
    {name: "settlementPeriod", label: "Дата заселения"},
];

function isFilled(value) {
    return value !== null && value !== undefined && String(value).trim() !== "";
}

function inRange(value, min, max) {
    const number = Number(value);
    return Number.isInteger(number) && number >= min && number <= max;
}

function isValidDate(value) {
    return value >= MIN_DATE && value <= new Date().toISOString().slice(0, 10);
}

export function formatValue(field, value) {
    if (field === "isForeign") {
        return value ? "Да" : "Нет";
    }
    if (!isFilled(value)) {
        return "—";
    }
    if (field === "settlementPeriod") {
        return value.split("-").reverse().join(".");
    }
    return String(value);
}

export function emptyFilters() {
    return {
        fullName: "",
        group: "",
        isuId: "",
        hasDormitory: "",
        dormitory: "",
        room: "",
        settlementPeriod: "",
        isForeign: "",
        notes: "",
    };
}

export function validateFilters(values) {
    const errors = {};
    if (values.fullName.length > SEARCH_MAX) {
        errors.fullName = `Не длиннее ${SEARCH_MAX} символов`;
    }
    if (isFilled(values.group) && !GROUP_REGEX.test(values.group.trim())) {
        errors.group = GROUP_ERROR;
    }
    if (isFilled(values.isuId) && !ISU_REGEX.test(String(values.isuId).trim())) {
        errors.isuId = ISU_ERROR;
    }
    if (isFilled(values.dormitory) && !inRange(values.dormitory, 1, 999)) {
        errors.dormitory = DORMITORY_ERROR;
    }
    if (isFilled(values.room) && !inRange(values.room, 1, 9999)) {
        errors.room = ROOM_ERROR;
    }
    if (values.notes.length > NOTES_MAX) {
        errors.notes = `Не длиннее ${NOTES_MAX} символов`;
    }
    return errors;
}

export function prepareFilters(values) {
    if (Object.keys(validateFilters(values)).length > 0) {
        return null;
    }
    const filters = {};
    for (const name of FILTER_NAMES) {
        if (isFilled(values[name])) {
            filters[name] = String(values[name]).trim();
        }
    }
    return filters;
}

export function queryFromUrl(params) {
    const filters = {};
    for (const name of FILTER_NAMES) {
        if (params.has(name)) {
            filters[name] = params.get(name);
        }
    }
    return {
        filters,
        sort: params.get("sort") ?? "fullName",
        order: params.get("order") ?? "asc",
        page: Number(params.get("page")) || 1,
        size: Number(params.get("size")) || 10,
    };
}

export function queryToParams(query) {
    return {...query.filters, sort: query.sort, order: query.order, page: query.page, size: query.size};
}

export function emptyStudentForm() {
    return {
        surname: "",
        name: "",
        patronymic: "",
        group: "",
        isuId: "",
        dormitory: "",
        room: "",
        settlementPeriod: "",
        isForeign: false,
        notes: "",
    };
}

export function studentToForm(student) {
    const [surname = "", name = "", patronymic = ""] = student.fullName.split(" ");
    return {
        surname,
        name,
        patronymic,
        group: student.group,
        isuId: String(student.isuId),
        dormitory: student.dormitory ?? "",
        room: student.room ?? "",
        settlementPeriod: student.settlementPeriod ?? "",
        isForeign: student.isForeign,
        notes: student.notes ?? "",
    };
}

export function formToStudent(form) {
    const fullName = [form.surname, form.name, form.patronymic]
        .map(part => part.trim())
        .filter(part => part !== "")
        .join(" ");
    return {
        fullName,
        group: form.group.trim(),
        isuId: Number(form.isuId),
        dormitory: isFilled(form.dormitory) ? Number(form.dormitory) : null,
        room: isFilled(form.room) ? Number(form.room) : null,
        settlementPeriod: isFilled(form.settlementPeriod) ? form.settlementPeriod : null,
        isForeign: form.isForeign,
        notes: form.notes.trim() === "" ? null : form.notes.trim(),
    };
}

export function validateStudentForm(form) {
    const errors = {};
    if (!SURNAME_REGEX.test(form.surname.trim())) {
        errors.surname = "От 2 до 43 букв кириллицей";
    }
    if (!NAME_REGEX.test(form.name.trim())) {
        errors.name = "От 2 до 45 букв кириллицей";
    }
    if (isFilled(form.patronymic) && !PATRONYMIC_REGEX.test(form.patronymic.trim())) {
        errors.patronymic = "От 2 до 45 букв кириллицей";
    }
    if (!GROUP_REGEX.test(form.group.trim())) {
        errors.group = GROUP_ERROR;
    }
    if (!ISU_REGEX.test(String(form.isuId).trim())) {
        errors.isuId = ISU_ERROR;
    }
    if (isFilled(form.dormitory) && !inRange(form.dormitory, 1, 999)) {
        errors.dormitory = DORMITORY_ERROR;
    }
    if (isFilled(form.room) && !inRange(form.room, 1, 9999)) {
        errors.room = ROOM_ERROR;
    }
    if (isFilled(form.settlementPeriod) && !isValidDate(form.settlementPeriod)) {
        errors.settlementPeriod = DATE_ERROR;
    }
    const filled = [form.dormitory, form.room, form.settlementPeriod].filter(isFilled).length;
    if (filled !== 0 && filled !== 3) {
        errors.settlementPeriod = errors.settlementPeriod ?? "Общежитие, комнату и дату нужно заполнить вместе";
    }
    if (form.notes.length > NOTES_MAX) {
        errors.notes = `Не длиннее ${NOTES_MAX} символов`;
    }
    return errors;
}
