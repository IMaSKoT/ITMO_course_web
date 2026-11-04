<script>
    import Link from "./Link.svelte";
    import {clearTokens, user} from "../stores/auth.js";
    import {navigate} from "../router/router.js";

    function logout() {
        clearTokens();
        navigate("/login");
    }
</script>

<header class="topbar">
    <h1>Студенты общежития</h1>
    {#if $user}
        <div id="user-bar">
            <Link href="/students" class="nav-link">Студенты</Link>
            <Link href="/profile" class="nav-link">{$user.username}</Link>
            <button type="button" class="secondary" onclick={logout}>Выйти</button>
        </div>
    {/if}
</header>
