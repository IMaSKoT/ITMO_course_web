const USERNAME_REGEX = /^[A-Za-z0-9_]{3,32}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-zА-Яа-яЁё])(?=.*\d).+$/;

export const ROLE_NAMES = {
    ADMIN: "Администратор",
    USER: "Пользователь",
};

export function validateLogin(form) {
    const errors = {};
    if (form.username.trim() === "") {
        errors.username = "Введите логин";
    }
    if (form.password === "") {
        errors.password = "Введите пароль";
    }
    return errors;
}

export function validateRegister(form) {
    const errors = {};
    if (!USERNAME_REGEX.test(form.username.trim())) {
        errors.username = "Логин: 3-32 символа, латиница, цифры и _";
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
        errors.email = "Некорректный email";
    }
    if (form.password.length < 8 || form.password.length > 72) {
        errors.password = "Пароль от 8 до 72 символов";
    } else if (!PASSWORD_REGEX.test(form.password)) {
        errors.password = "Пароль должен содержать хотя бы одну букву и одну цифру";
    }
    if (form.password !== form.passwordRepeat) {
        errors.passwordRepeat = "Пароли не совпадают";
    }
    return errors;
}
