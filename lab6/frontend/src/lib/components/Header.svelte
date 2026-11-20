<script>
    let {user} = $props();
</script>

<header class="topbar">
    <h1>Студенты общежития</h1>
    {#if user}
        <div id="user-bar">
            <a href="/students" class="nav-link">Студенты</a>
            {#if user.role === "ADMIN"}
                <a href="/journal" class="nav-link">Журнал</a>
                <a href="/transfer" class="nav-link">Импорт и экспорт</a>
            {/if}
            <a href="/profile" class="nav-link">{user.username}</a>
            <form method="POST" action="/logout">
                <button type="submit" class="secondary">Выйти</button>
            </form>
        </div>
    {/if}
</header>
