import {redirect} from "@sveltejs/kit";
import {logout} from "#lib/server/api.js";
import {clearSession, getRefreshToken} from "#lib/server/session.js";

export async function POST({cookies}) {
    const refreshToken = getRefreshToken(cookies);
    if (refreshToken) {
        await logout(refreshToken).catch(() => {});
    }
    clearSession(cookies);
    redirect(303, "/login");
}
