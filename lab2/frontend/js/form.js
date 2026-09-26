import {createStudent, getStudent, updateStudent} from "./api.js";
const form = document.querySelector('form');
const params = new URLSearchParams(window.location.search)
const idParam = params.get("isuId")
let editIsuId
// Проверка при изменении
if (idParam === null){
    editIsuId = null
} else {
    editIsuId = Number(idParam)
}

const isEditMode = editIsuId !== null
// Функция для update
async function prepare() {
    if (isEditMode == false){
        return;
    }
    try {
        const student = await getStudent(editIsuId)
        const nameParts = student.fullName.split(" ")

        document.getElementById('surname').value = nameParts[0]
        document.getElementById('name').value = nameParts[1]
        document.getElementById('patronymic').value = nameParts[2] ?? ""
        document.getElementById('group').value = student.group
        document.getElementById('isuId').value = student.isuId
        document.getElementById('isuId').readOnly = true
        document.getElementById('dormitory').value = student.dormitory
        document.getElementById('room').value = student.room
        document.getElementById('settlementPeriod').value = student.settlementPeriod
        document.getElementById('isForeign').checked = student.isForeign
        document.getElementById('notes').value = student.notes
    }
    catch (error) {
        alert(error.message)
        window.location.href = "index.html"
    }
}
prepare()
form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const fullName = (document.getElementById('surname').value + " " + document.getElementById('name').value +
     " " + document.getElementById('patronymic').value).trim();
    const group = document.getElementById('group').value
    const isuId = document.getElementById('isuId').value
    const dormitory = document.getElementById('dormitory').value
    const room = document.getElementById('room').value
    const settlementPeriod = document.getElementById('settlementPeriod').value
    const isForeign = document.getElementById('isForeign').checked
    const notes = (document.getElementById('notes').value).trim()
    const student = {
        fullName: fullName,
        group: group,
        isuId: Number(isuId),
        dormitory: dormitory === "" ? null : Number(dormitory),
        room: room === "" ? null : Number(room),
        settlementPeriod: settlementPeriod === "" ? null : settlementPeriod,
        isForeign: isForeign,
        notes: notes === "" ? null : notes
    };
    try {
        if (isEditMode){
            await updateStudent(editIsuId, student)
            window.location.href = "index.html?status=updated"
        }
        else {
            await createStudent(student)
            window.location.href = "index.html?status=added"
        }
    }
    catch (error) {
        alert(error.message)
    }
});