import {json} from "@sveltejs/kit";
import {clearCache} from "#lib/server/cache.js";

export function POST({locals}) {
    if (!locals.user) {
        return json({error: {message: "Нужно войти в систему"}}, {status: 401});
    }
    clearCache();
    return json({user: locals.user}, {headers: {"Cache-Control": "no-store"}});
}
