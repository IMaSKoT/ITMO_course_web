const form = document.querySelector('form');
const params = new URLSearchParams(window.location.search)
const idParam = params.get("id")
let studentId
// Проверка при изменении 
if (idParam === null){
    studentId = null
} else {
    studentId = Number(idParam)
}

const isEditMode = studentId !== null
// Функция для update
async function prepare() {
    if (isEditMode == false){
        return;
    }
    const student = await getStudent(studentId)
    const nameParts = student.fullName.split(" ")

    document.getElementById('surname').value = nameParts[0]
    document.getElementById('name').value = nameParts[1]
    document.getElementById('patronymic').value = nameParts[2] ?? ""
    document.getElementById('group').value = student.group
    document.getElementById('isuId').value = student.isuId
    document.getElementById('dormitory').value = student.dormitory
    document.getElementById('room').value = student.room
    document.getElementById('settlementPeriod').value = student.settlementPeriod
    document.getElementById('isForeign').checked = student.isForeign
    document.getElementById('notes').value = student.notes



    console.log(student)
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
    const dormInfo = [dormitory, room, settlementPeriod].filter(v => v !== "").length
    if (dormInfo !== 0 && dormInfo !== 3) {
    alert('Заполните все три поля об общежитии или оставьте их пустыми');
    return;}
    const isuCopy = (await getAllStudents()).find(s => s.isuId === isuId)
    if (isuCopy !== undefined && isuCopy.id !== studentId) {
    alert('Студент с таким ИСУ уже существует');
    return;}
    console.log(fullName, group, isuId, dormitory, room, settlementPeriod, isForeign, notes);
    const student = {
    fullName: fullName,
    group: group,
    isuId: isuId,
    dormitory: dormitory,
    room: room,
    settlementPeriod: settlementPeriod,
    isForeign: isForeign,
    notes: notes};
    console.log(student)
    if (isEditMode){
        student.id = studentId
        await updateStudent(student)
        window.location.href = "index.html?status=updated"
    } else {
        await addStudent(student)
        window.location.href = "index.html?status=added"
    }
});