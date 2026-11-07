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
<section class="student-info">
    <h2>{student.fullName}</h2>
    <p><strong>Группа:</strong> {student.group}</p>
    <p><strong>ИСУ:</strong> {student.isuId}</p>
    <p><strong>Номер общежития:</strong> {formatValue("dormitory", student.dormitory)}</p>
    <p><strong>Номер комнаты:</strong> {formatValue("room", student.room)}</p>
    <p><strong>Дата заселения:</strong> {formatValue("settlementPeriod", student.settlementPeriod)}</p>
    <p><strong>Иностранец:</strong> {formatValue("isForeign", student.isForeign)}</p>
    <section class="student-notes">
        <h3>Заметки</h3>
        <p id="student-notes">{formatValue("notes", student.notes)}</p>
    </section>
    {#if data.user.role === "ADMIN"}
        <div class="student-actions">
            <a href={`/students/${student.isuId}/edit`}>Изменить</a>
            <form
                method="POST"
                action="?/delete"
                use:enhance={submitForm(deleteStatus, {
                    confirmText: `Удалить студента ${student.fullName}?`,
                    notice: "Студент успешно удалён!",
                })}
            >
                <button type="submit" class="danger" disabled={deleteStatus.loading}>Удалить</button>
            </form>
        </div>
    {/if}
</section>
<a href="/students">Вернуться к списку студентов</a>
