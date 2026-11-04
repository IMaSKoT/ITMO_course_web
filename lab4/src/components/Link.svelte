<script>
    import {navigate} from "../router/router.js";

    let {href, class: className = "", children} = $props();

    function handleClick(event) {
        event.preventDefault();
        navigate(href);
    }
</script>

<a {href} class={className} onclick={handleClick}>{@render children()}</a>
