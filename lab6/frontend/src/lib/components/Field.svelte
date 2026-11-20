<script>
    let {id, label, error, children} = $props();
</script>

<div>
    <label for={id}>{label}</label>
    {@render children()}
</div>
{#if error}
    <p class="field-error">{error}</p>
{/if}
