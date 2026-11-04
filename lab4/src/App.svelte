<script>
    import Header from "./components/Header.svelte";
    import ForbiddenPage from "./pages/ForbiddenPage.svelte";
    import {findRoute} from "./router/routes.js";
    import {navigate, route} from "./router/router.js";
    import {user} from "./stores/auth.js";
    import {notice} from "./stores/notice.js";

    const current = $derived(findRoute($route.path));
    const access = $derived(checkAccess(current.access, $user));

    function checkAccess(required, currentUser) {
        if (required === "guest") {
            return currentUser ? "home" : "ok";
        }
        if (!required) {
            return "ok";
        }
        if (!currentUser) {
            return "login";
        }
        return required === "admin" && currentUser.role !== "ADMIN" ? "forbidden" : "ok";
    }

    function nextPage(query) {
        const next = query.get("next");
        return next && next.startsWith("/") && !next.startsWith("//") ? next : "/students";
    }

    $effect(() => {
        if (access === "login") {
            const next = encodeURIComponent(location.pathname + location.search);
            navigate(`/login?next=${next}`, true);
        } else if (access === "home") {
            navigate(nextPage($route.query), true);
        }
    });
</script>

<Header />
<main>
    {#if $notice}
        <p class="status" class:error={$notice.isError}>{$notice.text}</p>
    {/if}
    {#if access === "ok"}
        <current.component params={current.params} />
    {:else if access === "forbidden"}
        <ForbiddenPage />
    {/if}
</main>
