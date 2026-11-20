import {redirect} from "@sveltejs/kit";
import {deleteStudent, formError, getStudent, pageError} from "#lib/server/api.js";

export async function load({locals, params, cookies, depends}) {
    depends("app:students");
    try {
        return {student: await getStudent(locals.token, params.id)};
    } catch (err) {
        pageError(err, cookies);
    }
}

export const actions = {
    delete: async ({locals, params}) => {
        try {
            await deleteStudent(locals.token, params.id);
        } catch (err) {
            return formError(err);
        }
        redirect(303, "/students");
    },
};
