<script>
    import {onMount} from "svelte";
    import {goto} from "$app/navigation";
    import ErrorBox from "#lib/components/ErrorBox.svelte";
    import Pagination from "#lib/components/Pagination.svelte";
    import StudentFilters from "#lib/components/StudentFilters.svelte";
    import StudentTable from "#lib/components/StudentTable.svelte";
    import {prepareFilters, queryToParams} from "#lib/domain/student.js";
    import {startPolling, submitForm} from "#lib/forms.js";

    const INPUT_DELAY = 300;

    let {data, form} = $props();

    const isAdmin = $derived(data.user.role === "ADMIN");
    const deleteStatus = $state({loading: false});

    let filtersTimer;

    function update(changes) {
        const params = new URLSearchParams(queryToParams({...data.query, ...changes}));
        goto(`?${params}`, {replace: true, reset: false});
    }

    function handleFilters(values) {
        clearTimeout(filtersTimer);
        filtersTimer = setTimeout(() => {
            const filters = prepareFilters(values);
            if (filters && JSON.stringify(filters) !== JSON.stringify(data.query.filters)) {
                update({filters, page: 1});
            }
        }, INPUT_DELAY);
    }

    function toggleSort(field) {
        const {sort, order} = data.query;
        update({sort: field, order: sort === field && order === "asc" ? "desc" : "asc", page: 1});
    }

    function confirmDelete(student) {
        return submitForm(deleteStatus, {
            confirmText: `Удалить студента ${student.fullName}?`,
            notice: "Студент успешно удалён!",
        });
    }

    onMount(() => startPolling("app:students"));
</script>

<StudentFilters initial={data.query.filters} onchange={handleFilters} />

<ErrorBox error={form?.error} />

<StudentTable
    students={data.result.items}
    sort={data.query.sort}
    order={data.query.order}
    {isAdmin}
    deleting={deleteStatus.loading}
    onsort={toggleSort}
    ondelete={confirmDelete}
/>
<Pagination
    page={data.result.page}
    totalPages={data.result.totalPages}
    totalItems={data.result.totalItems}
    size={data.query.size}
    onpage={page => update({page})}
    onsize={size => update({size, page: 1})}
/>

{#if isAdmin}
    <a href="/students/new">Добавить студента</a>
{/if}
