<script>
    import {onDestroy} from "svelte";
    import ErrorBox from "../components/ErrorBox.svelte";
    import Link from "../components/Link.svelte";
    import Loader from "../components/Loader.svelte";
    import StudentForm from "../components/StudentForm.svelte";
    import {createStudent, getStudent, replaceStudent} from "../api/students.js";
    import {emptyStudentForm, formToStudent, studentToForm} from "../domain/student.js";
    import {createAction} from "../rx/action.js";
    import {createLoader} from "../rx/loader.js";
    import {navigate} from "../router/router.js";
    import {showNotice} from "../stores/notice.js";

    let {params} = $props();

    const isEdit = $derived(params.isuId !== undefined);

    const loader = createLoader(getStudent);
    const save = createAction(
        (form, signal) => isEdit
            ? replaceStudent(params.isuId, formToStudent(form), signal)
            : createStudent(formToStudent(form), signal),
        () => {
            showNotice(isEdit ? "Данные студента успешно изменены!" : "Студент успешно добавлен!");
            navigate("/students");
        }
    );
    const student = loader.state;
    const saveState = save.state;

    $effect(() => {
        if (isEdit) {
            loader.load(params.isuId);
        }
    });

    onDestroy(() => {
        loader.destroy();
        save.destroy();
    });
</script>

<h2>{isEdit ? "Редактирование студента" : "Добавление студента"}</h2>
{#if !isEdit}
    <StudentForm
        initial={emptyStudentForm()}
        submitting={$saveState.status === "loading"}
        error={$saveState.error}
        onsubmit={save.run}
    />
{:else if $student.status === "loading"}
    <Loader />
{:else if $student.status === "error"}
    <ErrorBox error={$student.error} />
{:else}
    <StudentForm
        initial={studentToForm($student.data)}
        submitting={$saveState.status === "loading"}
        error={$saveState.error}
        onsubmit={save.run}
    />
{/if}
<Link href="/students">Вернуться к таблице</Link>
