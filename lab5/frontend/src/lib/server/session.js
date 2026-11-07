import {error} from "@sveltejs/kit";

const ACCESS_COOKIE = "accessToken";
const REFRESH_COOKIE = "refreshToken";
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;
const EXPIRE_GAP = 5;

function cookieOptions(maxAge) {
    return {path: "/", httpOnly: true, sameSite: "lax", secure: process.env.AUTH_COOKIE_SECURE === "true", maxAge};
}

export function readUser(token) {
    if (!token) {
        return null;
    }
    try {
        const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
        return {username: payload.sub, role: payload.role, exp: payload.exp};
    } catch {
        return null;
    }
}

export function isExpired(user) {
    return !user || user.exp - EXPIRE_GAP <= Date.now() / 1000;
}

export function getAccessToken(cookies) {
    return cookies.get(ACCESS_COOKIE);
}

export function getRefreshToken(cookies) {
    return cookies.get(REFRESH_COOKIE);
}

export function saveSession(cookies, tokens) {
    const user = readUser(tokens.accessToken);
    const accessMaxAge = Math.max(Math.floor(user.exp - Date.now() / 1000), 0);
    cookies.set(ACCESS_COOKIE, tokens.accessToken, cookieOptions(accessMaxAge));
    cookies.set(REFRESH_COOKIE, tokens.refreshToken, cookieOptions(REFRESH_MAX_AGE));
    return user;
}

export function clearSession(cookies) {
    cookies.delete(ACCESS_COOKIE, {path: "/"});
    cookies.delete(REFRESH_COOKIE, {path: "/"});
}

export function requireAdmin(locals) {
    if (locals.user?.role !== "ADMIN") {
        error(403, "Недостаточно прав: эта страница доступна только администратору");
    }
}
