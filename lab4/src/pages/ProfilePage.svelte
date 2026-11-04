<script>
    import {onDestroy, onMount} from "svelte";
    import ErrorBox from "../components/ErrorBox.svelte";
    import Loader from "../components/Loader.svelte";
    import {getMe} from "../api/auth.js";
    import {ROLE_NAMES} from "../domain/user.js";
    import {createLoader} from "../rx/loader.js";

    const loader = createLoader((_, signal) => getMe(signal));
    const profile = loader.state;

    onMount(() => loader.load());
    onDestroy(loader.destroy);
</script>

<h2>Профиль</h2>
{#if $profile.status === "loading"}
    <Loader />
{:else if $profile.status === "error"}
    <ErrorBox error={$profile.error} />
{:else}
    <section class="student-info">
        <h2>{$profile.data.username}</h2>
        <p><strong>Email:</strong> {$profile.data.email}</p>
        <p><strong>Роль:</strong> {ROLE_NAMES[$profile.data.role] ?? $profile.data.role}</p>
    </section>
{/if}
