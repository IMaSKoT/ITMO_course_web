<script>
    let {page, totalPages, totalItems, size, onpage, onsize} = $props();
</script>

<nav class="d-flex flex-wrap align-items-center gap-2" aria-label="Страницы списка">
    <button type="button" class="btn btn-outline-primary btn-sm" disabled={page <= 1} onclick={() => onpage(page - 1)}>← Назад</button>
    <span>{totalItems === 0 ? "Нет записей" : `Страница ${page} из ${totalPages}, всего ${totalItems}`}</span>
    <button type="button" class="btn btn-outline-primary btn-sm" disabled={page >= totalPages} onclick={() => onpage(page + 1)}>Вперёд →</button>
    <label class="d-flex align-items-center gap-2 ms-sm-auto">
        На странице
        <select class="form-select form-select-sm w-auto" value={size} onchange={event => onsize(Number(event.target.value))}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
        </select>
    </label>
</nav>
