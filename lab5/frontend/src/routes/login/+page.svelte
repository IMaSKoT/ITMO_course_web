<script>
    import {enhance} from "$app/forms";
    import {page} from "$app/state";
    import ErrorBox from "#lib/components/ErrorBox.svelte";
    import Field from "#lib/components/Field.svelte";
    import {submitForm} from "#lib/forms.js";

    let {form} = $props();

    const status = $state({loading: false});
    const errors = $derived(form?.errors ?? {});
</script>

<section class="auth card mx-auto mt-md-5 p-4 p-md-5 shadow-sm">
    <h2>Вход</h2>
    <ErrorBox error={form?.error} />
    <form method="POST" novalidate use:enhance={submitForm(status)}>
        <Field id="username" label="Логин" error={errors.username}>
            <input class="form-control" id="username" name="username" type="text" autocomplete="username" value={form?.values?.username ?? ""}>
        </Field>
        <Field id="password" label="Пароль" error={errors.password}>
            <input class="form-control" id="password" name="password" type="password" autocomplete="current-password">
        </Field>
        <div>
            <button type="submit" class="btn btn-primary w-100" disabled={status.loading}>{status.loading ? "Вход..." : "Войти"}</button>
        </div>
    </form>
    <p class="mt-3 mb-0">Нет аккаунта? <a href={`/register${page.url.search}`}>Зарегистрироваться</a></p>
</section>
