const form = document.querySelector('form');
form.addEventListener('submit', function (event) {
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
    addStudent(student)
});