<script>
    import StudentForm from "#lib/components/StudentForm.svelte";
    import {emptyStudentForm} from "#lib/domain/student.js";

    let {form} = $props();
</script>

<h2>Добавление студента</h2>
<StudentForm initial={emptyStudentForm()} {form} notice="Студент успешно добавлен!" />
<a class="btn btn-outline-primary btn-sm mt-3" href="/students">Вернуться к таблице</a>
