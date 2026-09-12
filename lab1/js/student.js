const params = new URLSearchParams(window.location.search)
const id = Number(params.get("id"))

async function loadStudent() {
    const student = await getStudent(id);
    if (student === undefined) {
        document.querySelector(".student-info").textContent =
            "Студент не найден";
        return;
    }
    document.querySelector("#student-name").textContent = student.fullName
    document.querySelector("#student-group").textContent = student.group
    document.querySelector("#student-isu").textContent = student.isuId
    document.querySelector("#student-dormitory").textContent = student.dormitory
    document.querySelector("#student-room").textContent = student.room
    document.querySelector("#student-settlement-period").textContent = student.settlementPeriod
    document.querySelector("#student-foreign").textContent = student.isForeign ? "Да" : "Нет";
    document.querySelector("#student-notes").textContent = student.notes;

}

loadStudent()