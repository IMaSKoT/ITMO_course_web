<script>
    import "../app.css";
    import {navigating} from "$app/state";
    import Header from "#lib/components/Header.svelte";
    import Loader from "#lib/components/Loader.svelte";
    import {notice} from "#lib/stores/notice.js";

    let {data, children} = $props();
</script>

<Header user={data.user} />
<main>
    {#if $notice}
        <p class="status" class:error={$notice.isError}>{$notice.text}</p>
    {/if}
    {#if navigating.to}
        <Loader />
    {/if}
    {@render children()}
</main>
