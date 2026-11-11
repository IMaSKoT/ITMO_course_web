<script>
    import StudentForm from "#lib/components/StudentForm.svelte";
    import {studentToForm} from "#lib/domain/student.js";

    let {data, form} = $props();
</script>

<h2>Редактирование студента</h2>
<StudentForm initial={studentToForm(data.student)} {form} notice="Данные студента успешно изменены!" />
<a class="btn btn-outline-primary btn-sm mt-3" href="/students">Вернуться к таблице</a>
