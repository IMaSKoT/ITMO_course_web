import { students } from "./mock-data.js"
console.log(window.location.search)
const params = new URLSearchParams(window.location.search)
const id = Number(params.get("id"))
console.log(id)
const student = students.find(function(item){
    return item.id === id
})
console.log(student)
