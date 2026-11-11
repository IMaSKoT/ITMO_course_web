<script>
    import {page} from "$app/state";
    import ErrorBox from "#lib/components/ErrorBox.svelte";
</script>

<h2>Ошибка {page.status}</h2>
<ErrorBox error={page.error?.message} />
<a class="btn btn-outline-primary btn-sm mt-3" href="/students">Вернуться к списку студентов</a>
