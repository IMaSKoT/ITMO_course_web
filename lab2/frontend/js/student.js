import {getStudent} from "./api.js";
const params = new URLSearchParams(window.location.search)
const isuId = Number(params.get("isuId"))

async function loadStudent() {
    if (!Number.isInteger(isuId) || isuId <= 0) {
        document.querySelector(".student-info").textContent =
            "Студент не найден"
        return
    }
    try {
        const student = await getStudent(isuId);
        document.querySelector("#student-name").textContent = student.fullName
        document.querySelector("#student-group").textContent = student.group
        document.querySelector("#student-isu").textContent = student.isuId
        document.querySelector("#student-dormitory").textContent = student.dormitory
        document.querySelector("#student-room").textContent = student.room
        document.querySelector("#student-settlement-period").textContent = student.settlementPeriod
        document.querySelector("#student-foreign").textContent = student.isForeign ? "Да" : "Нет";
        document.querySelector("#student-notes").textContent = student.notes;
    }
    catch (error) {
        document.querySelector(".student-info").textContent = error.message
    }
}

loadStudent()