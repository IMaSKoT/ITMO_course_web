import {fail, redirect} from "@sveltejs/kit";
import {createStudent, formError} from "#lib/server/api.js";
import {requireAdmin} from "#lib/server/session.js";
import {hasErrors} from "#lib/domain/form.js";
import {formToStudent, readStudentForm, validateStudentForm} from "#lib/domain/student.js";

export function load({locals}) {
    requireAdmin(locals);
}

export const actions = {
    default: async ({request, locals}) => {
        const values = readStudentForm(await request.formData());
        const errors = validateStudentForm(values);
        if (hasErrors(errors)) {
            return fail(400, {errors, values});
        }
        try {
            await createStudent(locals.token, formToStudent(values));
        } catch (err) {
            return formError(err, values);
        }
        redirect(303, "/students");
    },
};
