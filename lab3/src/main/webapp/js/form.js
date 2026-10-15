import {createStudent, getStudent, replaceStudent} from "./api.js";
import {initPage, showError} from "./layout.js";

const user = initPage();

const form = document.querySelector("#student-form");
const errorBox = document.querySelector("#form-errors");
const submitButton = form.querySelector("button[type=submit]");
const idParam = new URLSearchParams(location.search).get("isuId");
const editIsuId = idParam === null ? null : Number(idParam);
const isEditMode = editIsuId !== null;

function field(id) {
    return document.getElementById(id);
}

// заполняем форму текущими данными студента
async function prepare() {
    document.querySelector("#form-title").textContent = "Редактирование студента";
    document.title = "Редактирование студента";
    try {
        const student = await getStudent(editIsuId);
        const nameParts = student.fullName.split(" ");
        field("surname").value = nameParts[0];
        field("name").value = nameParts[1] ?? "";
        field("patronymic").value = nameParts[2] ?? "";
        field("group").value = student.group;
        field("isuId").value = student.isuId;
        field("dormitory").value = student.dormitory ?? "";
        field("room").value = student.room ?? "";
        field("settlementPeriod").value = student.settlementPeriod ?? "";
        field("isForeign").checked = student.isForeign;
        field("notes").value = student.notes ?? "";
    } catch (error) {
        form.hidden = true;
        showError(errorBox, error);
    }
}

function readForm() {
    const fullName = [field("surname").value, field("name").value, field("patronymic").value]
        .map(part => part.trim())
        .filter(part => part !== "")
        .join(" ");
    const dormitory = field("dormitory").value;
    const room = field("room").value;
    const settlementPeriod = field("settlementPeriod").value;
    const notes = field("notes").value.trim();
    return {
        fullName: fullName,
        group: field("group").value.trim(),
        isuId: Number(field("isuId").value),
        dormitory: dormitory === "" ? null : Number(dormitory),
        room: room === "" ? null : Number(room),
        settlementPeriod: settlementPeriod === "" ? null : settlementPeriod,
        isForeign: field("isForeign").checked,
        notes: notes === "" ? null : notes,
    };
}

form.addEventListener("submit", async event => {
    event.preventDefault();
    const student = readForm();

    const dormitoryFilled = [student.dormitory, student.room, student.settlementPeriod]
        .filter(value => value !== null).length;
    if (dormitoryFilled !== 0 && dormitoryFilled !== 3) {
        showError(errorBox, "Данные об общежитии должны быть заполнены полностью");
        return;
    }

    submitButton.disabled = true;
    showError(errorBox, null);
    try {
        if (isEditMode) {
            await replaceStudent(editIsuId, student);
            location.href = "index.html?status=updated";
        } else {
            await createStudent(student);
            location.href = "index.html?status=added";
        }
    } catch (error) {
        showError(errorBox, error);
    } finally {
        submitButton.disabled = false;
    }
});

if (user && user.role !== "ADMIN") {
    form.hidden = true;
    showError(errorBox, "Добавлять и изменять студентов может только администратор");
} else if (user && isEditMode) {
    prepare();
}
