<script>
    import {onDestroy} from "svelte";
    import ErrorBox from "../components/ErrorBox.svelte";
    import Link from "../components/Link.svelte";
    import Loader from "../components/Loader.svelte";
    import Pagination from "../components/Pagination.svelte";
    import StudentFilters from "../components/StudentFilters.svelte";
    import StudentTable from "../components/StudentTable.svelte";
    import {deleteStudent, getStudents} from "../api/students.js";
    import {prepareFilters, queryFromUrl, queryToParams} from "../domain/student.js";
    import {createAction} from "../rx/action.js";
    import {createStudentList} from "../rx/studentList.js";
    import {setQuery} from "../router/router.js";
    import {user} from "../stores/auth.js";
    import {showNotice} from "../stores/notice.js";

    const initialQuery = queryFromUrl(new URLSearchParams(location.search));
    const list = createStudentList(getStudents, initialQuery, queryToParams, prepareFilters);
    const remove = createAction((student, signal) => deleteStudent(student.isuId, signal), () => {
        showNotice("Студент успешно удалён!");
        list.reload();
    });

    const listState = list.state;
    const listQuery = list.query;
    const removeState = remove.state;

    const isAdmin = $derived($user?.role === "ADMIN");

    $effect(() => {
        setQuery(new URLSearchParams(queryToParams($listQuery)));
    });

    function handleDelete(student) {
        if (confirm(`Удалить студента ${student.fullName}?`)) {
            remove.run(student);
        }
    }

    onDestroy(() => {
        list.destroy();
        remove.destroy();
    });
</script>

<StudentFilters initial={initialQuery.filters} onchange={list.setFilters} />

<ErrorBox error={$removeState.error} />
{#if $listState.status === "error"}
    <ErrorBox error={$listState.error} />
{/if}
{#if $listState.status === "loading"}
    <Loader />
{/if}

{#if $listState.data}
    <StudentTable
        students={$listState.data.items}
        sort={$listQuery.sort}
        order={$listQuery.order}
        {isAdmin}
        deleting={$removeState.status === "loading"}
        onsort={list.toggleSort}
        ondelete={handleDelete}
    />
    <Pagination
        page={$listState.data.page}
        totalPages={$listState.data.totalPages}
        totalItems={$listState.data.totalItems}
        size={$listQuery.size}
        onpage={list.setPage}
        onsize={list.setSize}
    />
{/if}

{#if isAdmin}
    <Link href="/students/new">Добавить студента</Link>
{/if}
