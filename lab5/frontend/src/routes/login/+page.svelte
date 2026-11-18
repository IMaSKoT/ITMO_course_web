<script>
    import {enhance} from "$app/forms";
    import {page} from "$app/state";
    import ErrorBox from "#lib/components/ErrorBox.svelte";
    import Field from "#lib/components/Field.svelte";
    import {readLoginForm, validateLogin} from "#lib/domain/user.js";
    import {submitForm, visibleErrors} from "#lib/forms.js";

    let {form} = $props();

    const status = $state({loading: false, errors: {}});
    const errors = $derived(visibleErrors(status, form));

    function validate(formData) {
        return validateLogin(readLoginForm(formData));
    }
</script>

<section class="auth">
    <h2>Вход</h2>
    <ErrorBox error={form?.error} />
    <form method="POST" novalidate use:enhance={submitForm(status, {validate})}>
        <Field id="username" label="Логин" error={errors.username}>
            <input id="username" name="username" type="text" autocomplete="username" value={form?.values?.username ?? ""}>
        </Field>
        <Field id="password" label="Пароль" error={errors.password}>
            <input id="password" name="password" type="password" autocomplete="current-password">
        </Field>
        <div>
            <button type="submit" disabled={status.loading}>{status.loading ? "Вход..." : "Войти"}</button>
        </div>
    </form>
    <p class="auth-switch">Нет аккаунта? <a href={`/register${page.url.search}`}>Зарегистрироваться</a></p>
</section>
