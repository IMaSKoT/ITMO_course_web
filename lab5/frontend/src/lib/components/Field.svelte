<script>
    let {id, label, error, children} = $props();
</script>

<div class="mb-3">
    <label class="form-label" for={id}>{label}</label>
    {@render children()}
    {#if error}
        <p class="small text-danger mt-1 mb-0">{error}</p>
    {/if}
</div>
