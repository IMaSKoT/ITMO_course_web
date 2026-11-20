<script>
    import {enhance} from "$app/forms";
    import {formatValue, SORT_FIELDS} from "../domain/student.js";

    let {students, sort, order, isAdmin, deleting, onsort, ondelete} = $props();
</script>

<div class="table-wrap">
    <table>
        <thead>
            <tr>
                {#each SORT_FIELDS as field (field.name)}
                    <th aria-sort={sort === field.name ? (order === "asc" ? "ascending" : "descending") : undefined}>
                        <button type="button" data-order={sort === field.name ? order : ""} onclick={() => onsort(field.name)}>
                            {field.label}
                        </button>
                    </th>
                {/each}
                <th>Иностранец</th>
                <th>Заметки</th>
                <th>Действия</th>
            </tr>
        </thead>
        <tbody>
            {#each students as student (student.isuId)}
                <tr>
                    <td>{student.fullName}</td>
                    <td>{student.group}</td>
                    <td>{student.isuId}</td>
                    <td>{formatValue("dormitory", student.dormitory)}</td>
                    <td>{formatValue("room", student.room)}</td>
                    <td>{formatValue("settlementPeriod", student.settlementPeriod)}</td>
                    <td>{formatValue("isForeign", student.isForeign)}</td>
                    <td>{formatValue("notes", student.notes)}</td>
                    <td class="actions">
                        <a href={`/students/${student.isuId}`}>Подробнее</a>
                        {#if isAdmin}
                            <a href={`/students/${student.isuId}/edit`}>Изменить</a>
                            <form method="POST" action="?/delete" use:enhance={ondelete(student)}>
                                <input type="hidden" name="isuId" value={student.isuId}>
                                <button type="submit" disabled={deleting}>Удалить</button>
                            </form>
                        {/if}
                    </td>
                </tr>
            {:else}
                <tr>
                    <td class="empty" colspan="9">Студенты не найдены</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
