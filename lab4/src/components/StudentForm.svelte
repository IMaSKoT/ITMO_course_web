<script>
    import {untrack} from "svelte";
    import ErrorBox from "./ErrorBox.svelte";
    import Field from "./Field.svelte";
    import {validateStudentForm} from "../domain/student.js";

    let {initial, submitting, error, onsubmit} = $props();

    let form = $state({...untrack(() => initial)});
    let errors = $state({});

    function handleSubmit(event) {
        event.preventDefault();
        errors = validateStudentForm(form);
        if (Object.keys(errors).length === 0) {
            onsubmit({...form});
        }
    }
</script>

<ErrorBox {error} />
<form id="student-form" novalidate onsubmit={handleSubmit}>
    <Field id="surname" label="Фамилия" error={errors.surname}>
        <input id="surname" type="text" placeholder="Иванов" bind:value={form.surname}>
    </Field>
    <Field id="name" label="Имя" error={errors.name}>
        <input id="name" type="text" placeholder="Иван" bind:value={form.name}>
    </Field>
    <Field id="patronymic" label="Отчество" error={errors.patronymic}>
        <input id="patronymic" type="text" placeholder="Иванович" bind:value={form.patronymic}>
    </Field>
    <Field id="group" label="Группа" error={errors.group}>
        <input id="group" type="text" placeholder="P3210" bind:value={form.group}>
    </Field>
    <Field id="isuId" label="ИСУ" error={errors.isuId}>
        <input id="isuId" type="text" placeholder="555555" bind:value={form.isuId}>
    </Field>
    <Field id="dormitory" label="Номер общежития" error={errors.dormitory}>
        <input id="dormitory" type="text" placeholder="8" bind:value={form.dormitory}>
    </Field>
    <Field id="room" label="Номер комнаты" error={errors.room}>
        <input id="room" type="text" placeholder="412" bind:value={form.room}>
    </Field>
    <Field id="settlementPeriod" label="Дата заселения" error={errors.settlementPeriod}>
        <input id="settlementPeriod" type="date" min="2000-01-01" bind:value={form.settlementPeriod}>
    </Field>
    <p class="hint">Общежитие, комнату и дату заселения нужно заполнить вместе или оставить пустыми</p>
    <Field id="isForeign" label="Иностранный гражданин">
        <input id="isForeign" type="checkbox" bind:checked={form.isForeign}>
    </Field>
    <Field id="notes" label="Заметки" error={errors.notes}>
        <textarea id="notes" rows="5" placeholder="Заметки" bind:value={form.notes}></textarea>
    </Field>
    <div>
        <button type="submit" disabled={submitting}>{submitting ? "Сохранение..." : "Сохранить"}</button>
    </div>
</form>
