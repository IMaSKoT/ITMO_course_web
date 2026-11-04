<script>
    import {onDestroy} from "svelte";
    import ErrorBox from "../components/ErrorBox.svelte";
    import Field from "../components/Field.svelte";
    import Link from "../components/Link.svelte";
    import {register} from "../api/auth.js";
    import {validateRegister} from "../domain/user.js";
    import {createAction} from "../rx/action.js";

    let form = $state({username: "", email: "", password: "", passwordRepeat: ""});
    let errors = $state({});

    const action = createAction(register);
    const actionState = action.state;
    onDestroy(action.destroy);

    function handleSubmit(event) {
        event.preventDefault();
        errors = validateRegister(form);
        if (Object.keys(errors).length === 0) {
            action.run({username: form.username.trim(), email: form.email.trim(), password: form.password});
        }
    }
</script>

<section class="auth">
    <h2>Регистрация</h2>
    <ErrorBox error={$actionState.error} />
    <form novalidate onsubmit={handleSubmit}>
        <Field id="username" label="Логин" error={errors.username}>
            <input id="username" type="text" autocomplete="username" bind:value={form.username}>
        </Field>
        <Field id="email" label="Email" error={errors.email}>
            <input id="email" type="email" autocomplete="email" bind:value={form.email}>
        </Field>
        <Field id="password" label="Пароль" error={errors.password}>
            <input id="password" type="password" autocomplete="new-password" bind:value={form.password}>
        </Field>
        <Field id="passwordRepeat" label="Повторите пароль" error={errors.passwordRepeat}>
            <input id="passwordRepeat" type="password" autocomplete="new-password" bind:value={form.passwordRepeat}>
        </Field>
        <div>
            <button type="submit" disabled={$actionState.status === "loading"}>
                {$actionState.status === "loading" ? "Регистрация..." : "Зарегистрироваться"}
            </button>
        </div>
    </form>
    <p class="auth-switch">Уже есть аккаунт? <Link href="/login">Войти</Link></p>
</section>
