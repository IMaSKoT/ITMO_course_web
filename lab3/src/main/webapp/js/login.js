import {currentUser, login, register} from "./api.js";
import {showError} from "./layout.js";

const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
const errorBox = document.querySelector("#auth-errors");
const tabs = document.querySelectorAll(".tab");

// куда вернуться после входа, только в пределах нашего сайта
function nextPage() {
    const next = new URLSearchParams(location.search).get("next");
    if (next) {
        const url = new URL(next, location.origin);
        if (url.origin === location.origin && !url.pathname.endsWith("/login.html")) {
            return url.pathname + url.search;
        }
    }
    return "index.html";
}

if (currentUser()) {
    location.replace(nextPage());
}

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(other => other.classList.toggle("active", other === tab));
        loginForm.hidden = tab.dataset.form !== "login-form";
        registerForm.hidden = tab.dataset.form !== "register-form";
        showError(errorBox, null);
    });
});

async function submit(form, action) {
    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    showError(errorBox, null);
    try {
        await action();
        location.href = nextPage();
    } catch (error) {
        showError(errorBox, error);
    } finally {
        button.disabled = false;
    }
}

loginForm.addEventListener("submit", event => {
    event.preventDefault();
    const username = loginForm.elements.username.value.trim();
    const password = loginForm.elements.password.value;
    submit(loginForm, () => login(username, password));
});

registerForm.addEventListener("submit", event => {
    event.preventDefault();
    const username = registerForm.elements.username.value.trim();
    const email = registerForm.elements.email.value.trim();
    const password = registerForm.elements.password.value;
    if (password !== registerForm.elements.passwordRepeat.value) {
        showError(errorBox, "Пароли не совпадают");
        return;
    }
    submit(registerForm, async () => {
        await register({username, email, password});
        await login(username, password);
    });
});
