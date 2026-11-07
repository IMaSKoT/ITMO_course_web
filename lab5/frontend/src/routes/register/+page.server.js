import {fail, redirect} from "@sveltejs/kit";
import {formError, login, register} from "#lib/server/api.js";
import {saveSession} from "#lib/server/session.js";
import {hasErrors, readForm} from "#lib/domain/form.js";
import {nextPage, validateRegister} from "#lib/domain/user.js";

export const actions = {
    default: async ({request, cookies, url}) => {
        const form = readForm(await request.formData(), ["username", "email", "password", "passwordRepeat"]);
        const values = {username: form.username, email: form.email};
        const errors = validateRegister(form);
        if (hasErrors(errors)) {
            return fail(400, {errors, values});
        }
        const username = form.username.trim();
        try {
            await register(username, form.email.trim(), form.password);
            saveSession(cookies, await login(username, form.password));
        } catch (err) {
            return formError(err, values);
        }
        redirect(303, nextPage(url));
    },
};
