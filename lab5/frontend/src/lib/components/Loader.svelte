<script>
    let {text = "Загрузка..."} = $props();
</script>

<p class="d-flex align-items-center gap-2 text-body-secondary" role="status">
    <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
    {text}
</p>
