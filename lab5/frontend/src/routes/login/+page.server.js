import {fail, redirect} from "@sveltejs/kit";
import {formError, login} from "#lib/server/api.js";
import {saveSession} from "#lib/server/session.js";
import {hasErrors, readForm} from "#lib/domain/form.js";
import {nextPage, validateLogin} from "#lib/domain/user.js";

export const actions = {
    default: async ({request, cookies, url}) => {
        const form = readForm(await request.formData(), ["username", "password"]);
        const values = {username: form.username};
        const errors = validateLogin(form);
        if (hasErrors(errors)) {
            return fail(400, {errors, values});
        }
        try {
            saveSession(cookies, await login(form.username.trim(), form.password));
        } catch (err) {
            return formError(err, values);
        }
        redirect(303, nextPage(url));
    },
};
