<script>
    import {onDestroy} from "svelte";
    import ErrorBox from "../components/ErrorBox.svelte";
    import Field from "../components/Field.svelte";
    import Link from "../components/Link.svelte";
    import {login} from "../api/auth.js";
    import {validateLogin} from "../domain/user.js";
    import {createAction} from "../rx/action.js";

    let form = $state({username: "", password: ""});
    let errors = $state({});

    const action = createAction(login);
    const actionState = action.state;
    onDestroy(action.destroy);

    function handleSubmit(event) {
        event.preventDefault();
        errors = validateLogin(form);
        if (Object.keys(errors).length === 0) {
            action.run({username: form.username.trim(), password: form.password});
        }
    }
</script>

<section class="auth">
    <h2>Вход</h2>
    <ErrorBox error={$actionState.error} />
    <form novalidate onsubmit={handleSubmit}>
        <Field id="username" label="Логин" error={errors.username}>
            <input id="username" type="text" autocomplete="username" bind:value={form.username}>
        </Field>
        <Field id="password" label="Пароль" error={errors.password}>
            <input id="password" type="password" autocomplete="current-password" bind:value={form.password}>
        </Field>
        <div>
            <button type="submit" disabled={$actionState.status === "loading"}>
                {$actionState.status === "loading" ? "Вход..." : "Войти"}
            </button>
        </div>
    </form>
    <p class="auth-switch">Нет аккаунта? <Link href="/register">Зарегистрироваться</Link></p>
</section>
