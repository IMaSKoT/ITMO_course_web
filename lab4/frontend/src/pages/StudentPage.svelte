<script>
    import {onDestroy} from "svelte";
    import ErrorBox from "../components/ErrorBox.svelte";
    import Link from "../components/Link.svelte";
    import Loader from "../components/Loader.svelte";
    import {deleteStudent, getStudent} from "../api/students.js";
    import {formatValue} from "../domain/student.js";
    import {createAction} from "../rx/action.js";
    import {createLoader} from "../rx/loader.js";
    import {toPollingState} from "../rx/request.js";
    import {navigate} from "../router/router.js";
    import {user} from "../stores/auth.js";
    import {showNotice} from "../stores/notice.js";

    let {params} = $props();

    const loader = createLoader(getStudent, toPollingState);
    const remove = createAction(deleteStudent, () => {
        showNotice("Студент успешно удалён!");
        navigate("/students");
    });
    const student = loader.state;
    const removeState = remove.state;

    $effect(() => {
        loader.load(params.isuId);
    });

    function handleDelete() {
        if (confirm(`Удалить студента ${$student.data.fullName}?`)) {
            remove.run($student.data.isuId);
        }
    }

    onDestroy(() => {
        loader.destroy();
        remove.destroy();
    });
</script>

<h2>Информация о студенте</h2>
<ErrorBox error={$removeState.error} />
{#if $student.status === "loading"}
    <Loader />
{:else if $student.status === "error"}
    <ErrorBox error={$student.error} />
{:else}
    <section class="student-info">
        <h2>{$student.data.fullName}</h2>
        <p><strong>Группа:</strong> {$student.data.group}</p>
        <p><strong>ИСУ:</strong> {$student.data.isuId}</p>
        <p><strong>Номер общежития:</strong> {formatValue("dormitory", $student.data.dormitory)}</p>
        <p><strong>Номер комнаты:</strong> {formatValue("room", $student.data.room)}</p>
        <p><strong>Дата заселения:</strong> {formatValue("settlementPeriod", $student.data.settlementPeriod)}</p>
        <p><strong>Иностранец:</strong> {formatValue("isForeign", $student.data.isForeign)}</p>
        <section class="student-notes">
            <h3>Заметки</h3>
            <p id="student-notes">{formatValue("notes", $student.data.notes)}</p>
        </section>
        {#if $user?.role === "ADMIN"}
            <div class="student-actions">
                <Link href={`/students/${$student.data.isuId}/edit`}>Изменить</Link>
                <button type="button" class="danger" disabled={$removeState.status === "loading"} onclick={handleDelete}>
                    Удалить
                </button>
            </div>
        {/if}
    </section>
{/if}
<Link href="/students">Вернуться к списку студентов</Link>
