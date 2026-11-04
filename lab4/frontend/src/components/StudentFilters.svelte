<script>
    import {untrack} from "svelte";
    import {emptyFilters, validateFilters} from "../domain/student.js";

    let {initial, onchange} = $props();

    let values = $state({...emptyFilters(), ...untrack(() => initial)});
    const errors = $derived(validateFilters(values));

    function handleInput() {
        if (values.hasDormitory !== "true") {
            values.dormitory = "";
            values.room = "";
            values.settlementPeriod = "";
        }
        onchange({...values});
    }

    function handleReset(event) {
        event.preventDefault();
        values = emptyFilters();
        onchange({...values});
    }
</script>

<form id="filters-form" novalidate oninput={handleInput} onchange={handleInput} onreset={handleReset} onsubmit={event => event.preventDefault()}>
    <label class="search">
        ФИО
        <input type="search" placeholder="Иванов" bind:value={values.fullName}>
        {#if errors.fullName}<small class="field-error">{errors.fullName}</small>{/if}
    </label>
    <label>
        Группа
        <input type="text" placeholder="P3210" bind:value={values.group}>
        {#if errors.group}<small class="field-error">{errors.group}</small>{/if}
    </label>
    <label>
        ИСУ
        <input type="text" placeholder="555555" bind:value={values.isuId}>
        {#if errors.isuId}<small class="field-error">{errors.isuId}</small>{/if}
    </label>
    <label>
        Наличие общежития
        <select bind:value={values.hasDormitory}>
            <option value="">Любое</option>
            <option value="true">Есть</option>
            <option value="false">Нет</option>
        </select>
    </label>
    {#if values.hasDormitory === "true"}
        <label>
            Номер общежития
            <input type="text" placeholder="8" bind:value={values.dormitory}>
            {#if errors.dormitory}<small class="field-error">{errors.dormitory}</small>{/if}
        </label>
        <label>
            Комната
            <input type="text" placeholder="412" bind:value={values.room}>
            {#if errors.room}<small class="field-error">{errors.room}</small>{/if}
        </label>
        <label>
            Дата заселения
            <input type="date" min="2000-01-01" bind:value={values.settlementPeriod}>
        </label>
    {/if}
    <label>
        Иностранец
        <select bind:value={values.isForeign}>
            <option value="">Любой</option>
            <option value="true">Да</option>
            <option value="false">Нет</option>
        </select>
    </label>
    <label>
        Заметки
        <input type="text" placeholder="Староста" bind:value={values.notes}>
        {#if errors.notes}<small class="field-error">{errors.notes}</small>{/if}
    </label>
    <button type="reset" class="secondary">Сбросить</button>
</form>
