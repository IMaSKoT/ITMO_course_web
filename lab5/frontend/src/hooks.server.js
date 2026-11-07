import {redirect} from "@sveltejs/kit";
import {refresh} from "#lib/server/api.js";
import {clearSession, getAccessToken, getRefreshToken, isExpired, readUser, saveSession} from "#lib/server/session.js";
import {nextPage} from "#lib/domain/user.js";

const GUEST_ROUTES = ["/login", "/register"];

async function loadSession(event) {
    let token = getAccessToken(event.cookies);
    let user = readUser(token);
    const refreshToken = getRefreshToken(event.cookies);
    if (isExpired(user) && refreshToken) {
        try {
            const tokens = await refresh(refreshToken);
            user = saveSession(event.cookies, tokens);
            token = tokens.accessToken;
        } catch {
            clearSession(event.cookies);
        }
    }
    if (isExpired(user)) {
        event.locals.user = null;
        event.locals.token = null;
    } else {
        event.locals.user = {username: user.username, role: user.role};
        event.locals.token = token;
    }
}

function checkAccess(event) {
    const routeId = event.route.id;
    if (!routeId) {
        return;
    }
    const {user} = event.locals;
    if (GUEST_ROUTES.includes(routeId)) {
        if (user) {
            redirect(303, nextPage(event.url));
        }
    } else if (!user) {
        const next = encodeURIComponent(event.url.pathname + event.url.search);
        redirect(303, `/login?next=${next}`);
    }
}

export async function handle({event, resolve}) {
    await loadSession(event);
    checkAccess(event);
    return resolve(event);
}

export function handleError({kind, error}) {
    if (kind === "framework" && error.status === 404) {
        return {message: "Страница не найдена"};
    }
    if (kind === "unknown") {
        console.error(error);
        return {message: "Внутренняя ошибка сервера"};
    }
}
