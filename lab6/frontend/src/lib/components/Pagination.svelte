<script>
    let {page, totalPages, totalItems, size, onpage, onsize} = $props();
</script>

<nav class="pagination">
    <button type="button" class="secondary" disabled={page <= 1} onclick={() => onpage(page - 1)}>← Назад</button>
    <span>{totalItems === 0 ? "Нет записей" : `Страница ${page} из ${totalPages}, всего ${totalItems}`}</span>
    <button type="button" class="secondary" disabled={page >= totalPages} onclick={() => onpage(page + 1)}>Вперёд →</button>
    <label>
        На странице
        <select value={size} onchange={event => onsize(Number(event.target.value))}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
        </select>
    </label>
</nav>
