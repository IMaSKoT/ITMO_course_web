import {redirect} from "@sveltejs/kit";
import {deleteStudent, formError, getStudents, pageError} from "#lib/server/api.js";
import {queryFromUrl, queryToParams} from "#lib/domain/student.js";

export async function load({locals, url, cookies, depends}) {
    depends("app:students");
    const query = queryFromUrl(url.searchParams);
    let result;
    try {
        result = await getStudents(locals.token, queryToParams(query));
    } catch (err) {
        pageError(err, cookies);
    }
    if (result.totalPages > 0 && query.page > result.totalPages) {
        redirect(307, `?${new URLSearchParams(queryToParams({...query, page: result.totalPages}))}`);
    }
    return {query, result};
}

export const actions = {
    delete: async ({request, locals}) => {
        const isuId = (await request.formData()).get("isuId");
        try {
            await deleteStudent(locals.token, isuId);
        } catch (err) {
            return formError(err);
        }
    },
};
