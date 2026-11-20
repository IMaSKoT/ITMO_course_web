<script>
    import {onMount} from "svelte";
    import {connectRealtime} from "#lib/realtime.js";

    let status = $state("Подключение уведомлений…");

    onMount(() => connectRealtime(value => status = value));
</script>

<p class="realtime-status" aria-live="polite">{status}</p>
