import { deleteStudent, getStudents} from "./api.js";
const params = new URLSearchParams(window.location.search)
const statusParam = params.get("status")

const tableBody = document.querySelector('#students-table-body')
const fields = ["fullName", "group", "isuId","dormitory", "room", "settlementPeriod", "isForeign", "notes"]
// Статус изменения/добавления на гланой странице
const statusMessage = document.querySelector("#status-message");
if (statusParam === "added") {
    statusMessage.textContent = "Студент успешно добавлен!";
}
if (statusParam === "updated") {
    statusMessage.textContent = "Данные студента успешно изменены!";
}
const filtersForm = document.querySelector('#filters-form')

function getFilters() {
    return Object.fromEntries(new FormData(filtersForm));
}

filtersForm.addEventListener("submit", function (event) {
    event.preventDefault();
    loadStudents(getFilters());
});

filtersForm.addEventListener("reset", function () {
    loadStudents();
});

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
            if (!confirm("Удалить студента?")) return
            try {
                await deleteStudent(student.isuId)
                statusMessage.textContent = 'Студент успешно удалён!'
                await loadStudents(getFilters())
            }
            catch (error) {
                statusMessage.textContent = error.message
            }
        })
        //Кнопка 'подробнее'
        const detailsLink = document.createElement("a")
        detailsLink.textContent = "Подробнее"
        detailsLink.href = `student.html?isuId=${student.isuId}`
        actionsCell.append(detailsLink)
        //Кнопка 'изменить'
        const changeLink = document.createElement("a")
        changeLink.textContent = "Изменить"
        changeLink.href = `form.html?isuId=${student.isuId}`
        actionsCell.append(changeLink)

        row.append(actionsCell)
        tableBody.append(row)
    })
}
async function loadStudents(filters = {}) {
    try {
        const students = await getStudents(filters);
        renderStudents(students)
    }
    catch (error) {
        statusMessage.textContent = error.message
    }
}

loadStudents();
