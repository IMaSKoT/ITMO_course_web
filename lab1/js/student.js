const params = new URLSearchParams(window.location.search)
const id = Number(params.get("id"))

async function loadStudent() {
    const student = await getStudent(id)
    console.log(student)
}

loadStudent()