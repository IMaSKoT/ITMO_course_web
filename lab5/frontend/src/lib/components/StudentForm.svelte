<script>
    import {enhance} from "$app/forms";
    import ErrorBox from "./ErrorBox.svelte";
    import Field from "./Field.svelte";
    import {submitForm} from "../forms.js";

    let {initial, form, notice} = $props();

    const values = $derived(form?.values ?? initial);
    const errors = $derived(form?.errors ?? {});
    const status = $state({loading: false});
</script>

<ErrorBox error={form?.error} />
<form class="student-form" id="student-form" method="POST" novalidate use:enhance={submitForm(status, {notice})}>
    <Field id="surname" label="Фамилия" error={errors.surname}>
        <input class="form-control" id="surname" name="surname" type="text" placeholder="Иванов" value={values.surname}>
    </Field>
    <Field id="name" label="Имя" error={errors.name}>
        <input class="form-control" id="name" name="name" type="text" placeholder="Иван" value={values.name}>
    </Field>
    <Field id="patronymic" label="Отчество" error={errors.patronymic}>
        <input class="form-control" id="patronymic" name="patronymic" type="text" placeholder="Иванович" value={values.patronymic}>
    </Field>
    <Field id="group" label="Группа" error={errors.group}>
        <input class="form-control" id="group" name="group" type="text" placeholder="P3210" value={values.group}>
    </Field>
    <Field id="isuId" label="ИСУ" error={errors.isuId}>
        <input class="form-control" id="isuId" name="isuId" type="text" placeholder="555555" value={values.isuId}>
    </Field>
    <Field id="dormitory" label="Номер общежития" error={errors.dormitory}>
        <input class="form-control" id="dormitory" name="dormitory" type="text" placeholder="8" value={values.dormitory}>
    </Field>
    <Field id="room" label="Номер комнаты" error={errors.room}>
        <input class="form-control" id="room" name="room" type="text" placeholder="412" value={values.room}>
    </Field>
    <Field id="settlementPeriod" label="Дата заселения" error={errors.settlementPeriod}>
        <input class="form-control" id="settlementPeriod" name="settlementPeriod" type="date" min="2000-01-01" value={values.settlementPeriod}>
    </Field>
    <p class="form-text mb-3">Общежитие, комнату и дату заселения нужно заполнить вместе или оставить пустыми</p>
    <Field id="isForeign" label="Иностранный гражданин">
        <input class="form-check-input ms-2" id="isForeign" name="isForeign" type="checkbox" checked={values.isForeign}>
    </Field>
    <Field id="notes" label="Заметки" error={errors.notes}>
        <textarea class="form-control" id="notes" name="notes" rows="5" placeholder="Заметки" value={values.notes}></textarea>
    </Field>
    <div>
        <button type="submit" class="btn btn-primary" disabled={status.loading}>{status.loading ? "Сохранение..." : "Сохранить"}</button>
    </div>
</form>

<style>
    .form-check-input:hover {
        cursor: pointer;
        outline: 2px solid var(--bs-border-color);
        outline-offset: 2px;
    }

    .form-check-input:focus:not(:focus-visible) {
        box-shadow: none;
    }

    .form-check-input:focus:not(:focus-visible):not(:checked) {
        border-color: var(--bs-border-color);
    }
</style>
