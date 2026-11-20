import {redirect} from "@sveltejs/kit";
import {pageError} from "#lib/server/api.js";
import {getJournal} from "#lib/server/realtime.js";
import {requireAdmin} from "#lib/server/session.js";

export async function load({locals, url, cookies, depends}) {
    requireAdmin(locals);
    depends("app:journal");
    const page = Number(url.searchParams.get("page") ?? 1);
    const size = Number(url.searchParams.get("size") ?? 20);
    let result;
    try {
        result = await getJournal(locals.token, page, size);
    } catch (err) {
        pageError(err, cookies);
    }
    if (result.totalPages > 0 && page > result.totalPages) {
        redirect(307, `?page=${result.totalPages}&size=${size}`);
    }
    return {result};
}
