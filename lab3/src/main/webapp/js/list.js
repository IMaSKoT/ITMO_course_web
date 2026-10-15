import {deleteStudent, getStudents} from "./api.js";
import {formatValue, initPage, showStatus} from "./layout.js";

const STATUS_TEXTS = {
    added: "Студент успешно добавлен!",
    updated: "Данные студента успешно изменены!",
    deleted: "Студент успешно удалён!",
};
const columns = ["fullName", "group", "isuId", "dormitory", "room", "settlementPeriod", "isForeign", "notes"];
const filterNames = ["fullName", "group", "isuId", "hasDormitory", "dormitory", "room", "settlementPeriod", "isForeign"];

const user = initPage();
const isAdmin = user?.role === "ADMIN";

const statusMessage = document.querySelector("#status-message");
const filtersForm = document.querySelector("#filters-form");
const hasDormitoryFilter = document.querySelector("#has-dormitory-filter");
const dormitoryFilters = document.querySelectorAll(".dormitory-filter");
const tableBody = document.querySelector("#students-table-body");
const sortButtons = document.querySelectorAll("th button[data-sort]");
const pageInfo = document.querySelector("#page-info");
const prevButton = document.querySelector("#prev-page");
const nextButton = document.querySelector("#next-page");
const pageSize = document.querySelector("#page-size");

const state = {sort: "fullName", order: "asc", page: 1, size: 10};

// фильтры, сортировка и страница хранятся в адресе, чтобы не терялись при возврате назад
function readUrl() {
    const params = new URLSearchParams(location.search);
    for (const name of filterNames) {
        const value = params.get(name);
        if (value !== null) {
            filtersForm.elements[name].value = value;
        }
    }
    state.sort = params.get("sort") ?? state.sort;
    state.order = params.get("order") ?? state.order;
    state.page = Number(params.get("page")) || state.page;
    state.size = Number(params.get("size")) || state.size;
    pageSize.value = String(state.size);

    const status = STATUS_TEXTS[params.get("status")];
    if (status) {
        showStatus(statusMessage, status);
    }
}

// поля общежития имеют смысл, только когда оно есть
function updateDormitoryFilters() {
    const hasDormitory = hasDormitoryFilter.value === "true";
    dormitoryFilters.forEach(filter => {
        filter.hidden = !hasDormitory;
        filter.querySelector("input").disabled = !hasDormitory;
    });
}

function getFilters() {
    const filters = {};
    for (const [key, value] of new FormData(filtersForm)) {
        if (value.trim() !== "") {
            filters[key] = value.trim();
        }
    }
    return filters;
}

async function loadStudents() {
    const params = {...getFilters(), sort: state.sort, order: state.order, page: state.page, size: state.size};
    history.replaceState(null, "", "?" + new URLSearchParams(params));
    renderSortIndicators();
    try {
        const result = await getStudents(params);
        // например, удалили последнего студента на последней странице
        if (result.totalPages > 0 && state.page > result.totalPages) {
            state.page = result.totalPages;
            return loadStudents();
        }
        renderStudents(result.items);
        renderPagination(result);
    } catch (error) {
        showStatus(statusMessage, error.message, true);
    }
}

function renderStudents(students) {
    tableBody.replaceChildren();
    if (students.length === 0) {
        const cell = tableBody.insertRow().insertCell();
        cell.colSpan = columns.length + 1;
        cell.className = "empty";
        cell.textContent = "Студенты не найдены";
        return;
    }

    for (const student of students) {
        const row = tableBody.insertRow();
        for (const column of columns) {
            row.insertCell().textContent = formatValue(column, student[column]);
        }

        const actions = row.insertCell();
        actions.className = "actions";
        actions.append(link("Подробнее", `student.html?isuId=${student.isuId}`));
        if (isAdmin) {
            actions.append(link("Изменить", `form.html?isuId=${student.isuId}`));
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Удалить";
            deleteButton.addEventListener("click", () => removeStudent(student));
            actions.append(deleteButton);
        }
    }
}

function link(text, href) {
    const element = document.createElement("a");
    element.textContent = text;
    element.href = href;
    return element;
}

async function removeStudent(student) {
    if (!confirm(`Удалить студента ${student.fullName}?`)) {
        return;
    }
    try {
        await deleteStudent(student.isuId);
        showStatus(statusMessage, STATUS_TEXTS.deleted);
        await loadStudents();
    } catch (error) {
        showStatus(statusMessage, error.message, true);
    }
}

function renderSortIndicators() {
    sortButtons.forEach(button => {
        const active = button.dataset.sort === state.sort;
        button.dataset.order = active ? state.order : "";
        if (active) {
            button.parentElement.setAttribute("aria-sort", state.order === "asc" ? "ascending" : "descending");
        } else {
            button.parentElement.removeAttribute("aria-sort");
        }
    });
}

function renderPagination({page, totalPages, totalItems}) {
    pageInfo.textContent = totalItems === 0
        ? "Нет записей"
        : `Страница ${page} из ${totalPages}, всего ${totalItems}`;
    prevButton.disabled = page <= 1;
    nextButton.disabled = page >= totalPages;
}

hasDormitoryFilter.addEventListener("change", updateDormitoryFilters);

filtersForm.addEventListener("submit", event => {
    event.preventDefault();
    state.page = 1;
    loadStudents();
});

filtersForm.addEventListener("reset", () => {
    // значения формы сбрасываются уже после события
    setTimeout(() => {
        updateDormitoryFilters();
        state.page = 1;
        loadStudents();
    }, 0);
});

sortButtons.forEach(button => {
    button.addEventListener("click", () => {
        const field = button.dataset.sort;
        if (state.sort === field) {
            state.order = state.order === "asc" ? "desc" : "asc";
        } else {
            state.sort = field;
            state.order = "asc";
        }
        state.page = 1;
        loadStudents();
    });
});

prevButton.addEventListener("click", () => {
    state.page -= 1;
    loadStudents();
});

nextButton.addEventListener("click", () => {
    state.page += 1;
    loadStudents();
});

pageSize.addEventListener("change", () => {
    state.size = Number(pageSize.value);
    state.page = 1;
    loadStudents();
});

if (user) {
    readUrl();
    updateDormitoryFilters();
    loadStudents();
}
