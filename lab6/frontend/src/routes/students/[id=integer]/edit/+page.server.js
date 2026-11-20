import {fail, redirect} from "@sveltejs/kit";
import {formError, getStudent, pageError, replaceStudent} from "#lib/server/api.js";
import {requireAdmin} from "#lib/server/session.js";
import {hasErrors} from "#lib/domain/form.js";
import {formToStudent, readStudentForm, validateStudentForm} from "#lib/domain/student.js";

export async function load({locals, params, cookies}) {
    requireAdmin(locals);
    try {
        return {student: await getStudent(locals.token, params.id)};
    } catch (err) {
        pageError(err, cookies);
    }
}

export const actions = {
    default: async ({request, locals, params}) => {
        const values = readStudentForm(await request.formData());
        const errors = validateStudentForm(values);
        if (hasErrors(errors)) {
            return fail(400, {errors, values});
        }
        try {
            await replaceStudent(locals.token, params.id, formToStudent(values));
        } catch (err) {
            return formError(err, values);
        }
        redirect(303, "/students");
    },
};
