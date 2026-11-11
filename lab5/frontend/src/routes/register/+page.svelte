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
    <h2>Регистрация</h2>
    <ErrorBox error={form?.error} />
    <form method="POST" novalidate use:enhance={submitForm(status)}>
        <Field id="username" label="Логин" error={errors.username}>
            <input class="form-control" id="username" name="username" type="text" autocomplete="username" value={form?.values?.username ?? ""}>
        </Field>
        <Field id="email" label="Email" error={errors.email}>
            <input class="form-control" id="email" name="email" type="email" autocomplete="email" value={form?.values?.email ?? ""}>
        </Field>
        <Field id="password" label="Пароль" error={errors.password}>
            <input class="form-control" id="password" name="password" type="password" autocomplete="new-password">
        </Field>
        <Field id="passwordRepeat" label="Повторите пароль" error={errors.passwordRepeat}>
            <input class="form-control" id="passwordRepeat" name="passwordRepeat" type="password" autocomplete="new-password">
        </Field>
        <div>
            <button type="submit" class="btn btn-primary w-100" disabled={status.loading}>
                {status.loading ? "Регистрация..." : "Зарегистрироваться"}
            </button>
        </div>
    </form>
    <p class="mt-3 mb-0">Уже есть аккаунт? <a href={`/login${page.url.search}`}>Войти</a></p>
</section>
