<script>
    import "bootswatch/dist/zephyr/bootstrap.min.css";
    import "../app.css";
    import {navigating} from "$app/state";
    import Header from "#lib/components/Header.svelte";
    import Loader from "#lib/components/Loader.svelte";
    import {notice} from "#lib/stores/notice.js";

    let {data, children} = $props();
</script>

<Header user={data.user} />
<main class="container-xxl py-4">
    {#if $notice}
        <p class="alert" class:alert-danger={$notice.isError} class:alert-success={!$notice.isError} role="status">{$notice.text}</p>
    {/if}
    {#if navigating.to}
        <Loader />
    {/if}
    {@render children()}
</main>
