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

<form id="filters-form" class="border bg-light p-3 mb-3" novalidate oninput={handleInput} onchange={handleInput} onreset={handleReset} onsubmit={event => event.preventDefault()}>
    <div class="row g-3">
        <label class="col-12 col-sm-6 col-lg-4">
            ФИО
            <input class="form-control form-control-sm mt-1" type="search" placeholder="Иванов" bind:value={values.fullName}>
            {#if errors.fullName}<small class="d-block small text-danger mt-1">{errors.fullName}</small>{/if}
        </label>
        <label class="col-12 col-sm-6 col-lg-4">
            Группа
            <input class="form-control form-control-sm mt-1" type="text" placeholder="P3210" bind:value={values.group}>
            {#if errors.group}<small class="d-block small text-danger mt-1">{errors.group}</small>{/if}
        </label>
        <label class="col-12 col-sm-6 col-lg-4">
            ИСУ
            <input class="form-control form-control-sm mt-1" type="text" placeholder="555555" bind:value={values.isuId}>
            {#if errors.isuId}<small class="d-block small text-danger mt-1">{errors.isuId}</small>{/if}
        </label>
        <label class="col-12 col-sm-6 col-lg-4">
            Наличие общежития
            <select class="form-select form-select-sm mt-1" bind:value={values.hasDormitory}>
                <option value="">Любое</option>
                <option value="true">Есть</option>
                <option value="false">Нет</option>
            </select>
        </label>
        {#if values.hasDormitory === "true"}
            <label class="col-12 col-sm-6 col-lg-4">
                Номер общежития
                <input class="form-control form-control-sm mt-1" type="text" placeholder="8" bind:value={values.dormitory}>
                {#if errors.dormitory}<small class="d-block small text-danger mt-1">{errors.dormitory}</small>{/if}
            </label>
            <label class="col-12 col-sm-6 col-lg-4">
                Комната
                <input class="form-control form-control-sm mt-1" type="text" placeholder="412" bind:value={values.room}>
                {#if errors.room}<small class="d-block small text-danger mt-1">{errors.room}</small>{/if}
            </label>
            <label class="col-12 col-sm-6 col-lg-4">
                Дата заселения
                <input class="form-control form-control-sm mt-1" type="date" min="2000-01-01" bind:value={values.settlementPeriod}>
            </label>
        {/if}
        <label class="col-12 col-sm-6 col-lg-4">
            Иностранец
            <select class="form-select form-select-sm mt-1" bind:value={values.isForeign}>
                <option value="">Любой</option>
                <option value="true">Да</option>
                <option value="false">Нет</option>
            </select>
        </label>
        <label class="col-12 col-sm-6 col-lg-4">
            Заметки
            <input class="form-control form-control-sm mt-1" type="text" placeholder="Староста" bind:value={values.notes}>
            {#if errors.notes}<small class="d-block small text-danger mt-1">{errors.notes}</small>{/if}
        </label>
        <div class="col-12">
            <button type="reset" class="btn btn-outline-primary btn-sm">Сбросить</button>
        </div>
    </div>
</form>
