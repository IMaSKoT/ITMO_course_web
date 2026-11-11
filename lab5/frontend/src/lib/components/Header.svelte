<script>
    let {user} = $props();
</script>

<header class="bg-body border-bottom">
    <div class="container-xxl d-flex flex-wrap justify-content-between align-items-center gap-3 py-3">
        <h1 class="h4 mb-0">Студенты общежития</h1>
        {#if user}
            <nav class="d-flex flex-wrap align-items-center gap-3" aria-label="Основное меню">
                <a href="/students" class="btn btn-outline-secondary btn-sm">Студенты</a>
                <a href="/profile" class="btn btn-outline-secondary btn-sm">{user.username}</a>
                <form method="POST" action="/logout">
                    <button type="submit" class="btn btn-outline-danger btn-sm">Выйти</button>
                </form>
            </nav>
        {/if}
    </div>
</header>
