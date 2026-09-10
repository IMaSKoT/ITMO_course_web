console.log('Привет')
const students = [
    {
        id: 1,
        fullName: "Пушкин Иван Алексеевич",
        group: "P3210",
        isuId: 123456
    },
    {
        id: 2,
        fullName: "Иванов Петр Сергеевич",
        group: "P3211",
        isuId: 654321
    }
];
const tableBody = document.querySelector('#students-table-body')
const fields = ["fullName", "group", "isuId"]
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
        row.append(actionsCell)

        //Назначем удаление кнопке
        deleteButton.addEventListener("click", function(){
            const index = students.findIndex(function(item){
                return item.id === student.id;
            })
            students.splice(index, 1)
            renderStudents(students)
        })
        tableBody.append(row)
    })
}
renderStudents(students)



