<script>
    import {onMount} from "svelte";
    import {enhance} from "$app/forms";
    import ErrorBox from "#lib/components/ErrorBox.svelte";
    import {formatValue} from "#lib/domain/student.js";
    import {startPolling, submitForm} from "#lib/forms.js";

    let {data, form} = $props();

    const student = $derived(data.student);
    const deleteStatus = $state({loading: false});

    onMount(() => startPolling("app:students"));
</script>

<h2>Информация о студенте</h2>
<ErrorBox error={form?.error} />
<section class="card p-4 mb-3">
    <h3 class="h5">{student.fullName}</h3>
    <p><strong>Группа:</strong> {student.group}</p>
    <p><strong>ИСУ:</strong> {student.isuId}</p>
    <p><strong>Номер общежития:</strong> {formatValue("dormitory", student.dormitory)}</p>
    <p><strong>Номер комнаты:</strong> {formatValue("room", student.room)}</p>
    <p><strong>Дата заселения:</strong> {formatValue("settlementPeriod", student.settlementPeriod)}</p>
    <p><strong>Иностранец:</strong> {formatValue("isForeign", student.isForeign)}</p>
    <section class="border-top pt-3 mt-2 text-break">
        <h4 class="h6">Заметки</h4>
        <p id="student-notes">{formatValue("notes", student.notes)}</p>
    </section>
    {#if data.user.role === "ADMIN"}
        <div class="d-flex flex-wrap align-items-center gap-2">
            <a class="btn btn-outline-primary btn-sm" href={`/students/${student.isuId}/edit`}>Изменить</a>
            <form
                method="POST"
                action="?/delete"
                use:enhance={submitForm(deleteStatus, {
                    confirmText: `Удалить студента ${student.fullName}?`,
                    notice: "Студент успешно удалён!",
                })}
            >
                <button type="submit" class="btn btn-outline-danger btn-sm" disabled={deleteStatus.loading}>Удалить</button>
            </form>
        </div>
    {/if}
</section>
<a class="btn btn-outline-primary btn-sm mt-3" href="/students">Вернуться к списку студентов</a>
