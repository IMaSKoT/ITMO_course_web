<script>
    import {goto, invalidate} from "$app/navigation";
    import Pagination from "#lib/components/Pagination.svelte";
    import {ACTION_LABELS} from "#lib/realtime.js";

    let {data} = $props();

    function update(page, size = data.result.size) {
        goto(`?page=${page}&size=${size}`, {replace: true, reset: false});
    }
</script>

<h2>Журнал действий</h2>
<p class="section-description">Успешные изменения студентов. Новые записи появляются автоматически.</p>
<button type="button" class="secondary" onclick={() => invalidate("app:journal")}>Обновить журнал</button>
<div class="table-wrap journal-table">
    <table>
        <thead>
            <tr><th>Время (UTC)</th><th>Пользователь</th><th>Действие</th><th>ИСУ</th><th>ФИО</th><th>Подробности</th></tr>
        </thead>
        <tbody>
            {#each data.result.items as entry (entry.id)}
                <tr>
                    <td>{entry.time.replace("T", " ").slice(0, 19)}</td>
                    <td>{entry.username}</td>
                    <td>{ACTION_LABELS[entry.action]}</td>
                    <td>{entry.isuId}</td>
                    <td>{entry.fullName}</td>
                    <td>{entry.details ?? "—"}</td>
                </tr>
            {:else}
                <tr><td class="empty" colspan="6">В журнале пока нет записей</td></tr>
            {/each}
        </tbody>
    </table>
</div>
<Pagination
    {...data.result}
    onpage={page => update(page)}
    onsize={size => update(1, size)}
/>
