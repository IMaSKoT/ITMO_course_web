import {currentUser, logout, redirectToLogin} from "./api.js";

const FIELD_LABELS = {
    fullName: "ФИО",
    group: "Группа",
    isuId: "ИСУ",
    dormitory: "Общежитие",
    room: "Комната",
    settlementPeriod: "Дата заселения",
    isForeign: "Иностранец",
    notes: "Заметки",
    username: "Логин",
    email: "Email",
    password: "Пароль",
};

// общая часть защищённых страниц: проверка входа, плашка пользователя, скрытие админских кнопок
export function initPage() {
    const user = currentUser();
    if (!user) {
        redirectToLogin();
        return null;
    }

    const userBar = document.querySelector("#user-bar");
    const name = document.createElement("span");
    name.textContent = user.username;
    const swaggerLink = document.createElement("a");
    swaggerLink.href = "swagger.html";
    swaggerLink.textContent = "Swagger";
    const logoutButton = document.createElement("button");
    logoutButton.type = "button";
    logoutButton.className = "secondary";
    logoutButton.textContent = "Выйти";
    logoutButton.addEventListener("click", logout);
    userBar.append(name, swaggerLink, logoutButton);

    document.querySelectorAll(".admin-only").forEach(element => {
        element.hidden = user.role !== "ADMIN";
    });
    return user;
}

export function formatValue(field, value) {
    if (field === "isForeign") {
        return value ? "Да" : "Нет";
    }
    if (value === null || value === undefined || value === "") {
        return "—";
    }
    if (field === "settlementPeriod") {
        return value.split("-").reverse().join(".");
    }
    return String(value);
}

export function showStatus(element, text, isError = false) {
    element.textContent = text;
    element.classList.toggle("error", isError);
    element.hidden = !text;
}

export function showError(box, error) {
    box.replaceChildren();
    box.hidden = !error;
    if (!error) {
        return;
    }

    const message = document.createElement("p");
    message.textContent = typeof error === "string" ? error : error.message;
    box.append(message);

    const details = error.details ?? [];
    if (details.length > 0) {
        const list = document.createElement("ul");
        for (const detail of details) {
            const item = document.createElement("li");
            const label = FIELD_LABELS[detail.field];
            item.textContent = label ? `${label}: ${detail.message}` : detail.message;
            list.append(item);
        }
        box.append(list);
    }
    box.scrollIntoView({block: "nearest"});
}
