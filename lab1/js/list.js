console.log('Привет')
const students = [
    {
        id: 1,
        fullName: "Пушкин Иван Алексеевич",
        group: "P3210",
        isuId: 123456,
        dormitory: 8,
        room: 412,
        settlementPeriod: "01.09.2026 — 30.06.2027",
        isForeign: false,
        notes: "Без особенностей"
    },
    {
        id: 2,
        fullName: "Иванов Петр Сергеевич",
        group: "P3211",
        isuId: 654321,
        dormitory: 10,
        room: 205,
        settlementPeriod: "01.09.2026 — 31.01.2027",
        isForeign: true,
        notes: "Требуется помощь с документами"
    }
];
const tableBody = document.querySelector('#students-table-body')
const fields = ["fullName", "group", "isuId","dormitory", "room", "settlementPeriod", "isForeign", "notes"]
// Функция добавления студентов в таблицу по списку студентов
function renderStudents(students){
    tableBody.innerHTML = "";

    students.forEach(function(student){
        const row = document.createElement("tr")
        fields.forEach(function(field){
            const elem = document.createElement("td")
            elem.textContent = student[field]
            row.append(elem)
        })
        //Кнопка 'удалить'
        const deleteButton = document.createElement("button")
        deleteButton.textContent = "Удалить"
        const actionsCell = document.createElement("td")
        actionsCell.append(deleteButton)
        //Назначем удаление кнопке
        deleteButton.addEventListener("click", function(){
            const index = students.findIndex(function(item){
                return item.id === student.id;
            })
            students.splice(index, 1)
            renderStudents(students)
        })
        //Кнопка 'подробнее'
        const detailsLink = document.createElement("a")
        detailsLink.textContent = "Подробнее"
        detailsLink.href = `student.html?id=${student.id}`
        actionsCell.append(detailsLink)
        //Кнопка 'изменить'
        const changeLink = document.createElement("a")
        changeLink.textContent = "Изменить"
        changeLink.href = `form.html?id=${student.id}`
        actionsCell.append(changeLink)

        row.append(actionsCell)
        tableBody.append(row)
    })
}
renderStudents(students)



