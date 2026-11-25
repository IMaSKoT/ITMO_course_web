<script>
    import "../app.css";
    import {navigating} from "$app/state";
    import Header from "#lib/components/Header.svelte";
    import Loader from "#lib/components/Loader.svelte";
    import RealtimeStatus from "#lib/components/RealtimeStatus.svelte";
    import {notice} from "#lib/stores/notice.js";

    let {data, children} = $props();
</script>

<Header user={data.user} />
<main>
    {#if data.user?.role === "ADMIN"}
        {#key data.user.username}
            <RealtimeStatus />
        {/key}
    {/if}
    {#if $notice}
    <p class="notice-toast" class:error={$notice.isError}>
        {$notice.text}
    </p>
    {/if}
    {#if navigating.to}
    <div class="navigation-loader">
        <Loader />
    </div>
    {/if}
    {@render children()}
</main>
