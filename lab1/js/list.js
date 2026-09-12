const tableBody = document.querySelector('#students-table-body')
const fields = ["fullName", "group", "isuId","dormitory", "room", "settlementPeriod", "isForeign", "notes"]
// Функция добавления студентов в таблицу по списку студентов
function renderStudents(students){
    tableBody.innerHTML = "";

    students.forEach(function(student){
        const row = document.createElement("tr")
        fields.forEach(function(field){
            const elem = document.createElement("td")
            if (field === "isForeign") {
                elem.textContent = student[field] ? "Да" : "Нет";
            } else {
                elem.textContent = student[field]
            }
            row.append(elem)
        })
        //Кнопка 'удалить'
        const deleteButton = document.createElement("button")
        deleteButton.textContent = "Удалить"
        const actionsCell = document.createElement("td")
        actionsCell.append(deleteButton)
        //Назначем удаление кнопке
        deleteButton.addEventListener("click", async function(){
            await deleteStudent(student.id)
            const students = await getAllStudents()
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
async function loadStudents() {
    const students = await getAllStudents();
    console.log(students)
    renderStudents(students)
}

loadStudents();



