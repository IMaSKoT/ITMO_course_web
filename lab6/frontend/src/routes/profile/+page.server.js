import {getMe, pageError} from "#lib/server/api.js";

export async function load({locals, cookies}) {
    try {
        return {profile: await getMe(locals.token)};
    } catch (err) {
        pageError(err, cookies);
    }
}
