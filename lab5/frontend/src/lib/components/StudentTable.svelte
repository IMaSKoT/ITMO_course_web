<script>
    import {enhance} from "$app/forms";
    import {formatValue, SORT_FIELDS} from "../domain/student.js";

    let {students, sort, order, isAdmin, deleting, onsort, ondelete} = $props();
</script>

<div class="table-responsive table-wrap border">
    <table class="table table-striped table-hover align-middle mb-0">
        <thead class="table-light">
            <tr>
                {#each SORT_FIELDS as field (field.name)}
                    <th class="text-nowrap" aria-sort={sort === field.name ? (order === "asc" ? "ascending" : "descending") : undefined}>
                        <button type="button" class="sort-button p-0 border-0 bg-transparent fw-semibold text-start" data-order={sort === field.name ? order : ""} onclick={() => onsort(field.name)}>
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
                    <td class="text-nowrap">
                        <a href={`/students/${student.isuId}`}>Подробнее</a>
                        {#if isAdmin}
                            <a class="ms-2" href={`/students/${student.isuId}/edit`}>Изменить</a>
                            <form class="d-inline-block ms-2" method="POST" action="?/delete" use:enhance={ondelete(student)}>
                                <input type="hidden" name="isuId" value={student.isuId}>
                                <button type="submit" class="btn btn-outline-danger btn-sm" disabled={deleting}>Удалить</button>
                            </form>
                        {/if}
                    </td>
                </tr>
            {:else}
                <tr>
                    <td class="text-center text-body-secondary py-4" colspan="9">Студенты не найдены</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
