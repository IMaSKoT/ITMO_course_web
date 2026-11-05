<script>
    import Link from "./Link.svelte";
    import {logout as revokeSession} from "../api/auth.js";
    import {clearTokens, user} from "../stores/auth.js";
    import {navigate} from "../router/router.js";

    function logout() {
        // выходим и при недоступном сервере, токен тогда просто доживёт свой срок
        revokeSession().catch(() => {});
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
