import {deleteStudent, getStudent} from "./api.js";
import {formatValue, initPage, showError} from "./layout.js";

const user = initPage();

const info = document.querySelector(".student-info");
const errorBox = document.querySelector("#student-errors");
const isuId = Number(new URLSearchParams(location.search).get("isuId"));

function setText(selector, field, value) {
    document.querySelector(selector).textContent = formatValue(field, value);
}

async function loadStudent() {
    if (!Number.isInteger(isuId) || isuId <= 0) {
        showError(errorBox, "Студент не найден");
        return;
    }
    try {
        const student = await getStudent(isuId);
        document.title = student.fullName;
        setText("#student-name", "fullName", student.fullName);
        setText("#student-group", "group", student.group);
        setText("#student-isu", "isuId", student.isuId);
        setText("#student-dormitory", "dormitory", student.dormitory);
        setText("#student-room", "room", student.room);
        setText("#student-settlement-period", "settlementPeriod", student.settlementPeriod);
        setText("#student-foreign", "isForeign", student.isForeign);
        setText("#student-notes", "notes", student.notes);
        document.querySelector("#edit-link").href = `form.html?isuId=${student.isuId}`;
        info.hidden = false;
    } catch (error) {
        showError(errorBox, error);
    }
}

document.querySelector("#delete-button").addEventListener("click", async () => {
    if (!confirm("Удалить студента?")) {
        return;
    }
    try {
        await deleteStudent(isuId);
        location.href = "index.html?status=deleted";
    } catch (error) {
        showError(errorBox, error);
    }
});

if (user) {
    loadStudent();
}
