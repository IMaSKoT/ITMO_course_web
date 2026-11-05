import {writable} from "svelte/store";
import {filter, fromEvent} from "rxjs";

const ACCESS_KEY = "accessToken";

// refresh-токен теперь в cookie, убираем копию, оставшуюся от старых сессий
localStorage.removeItem("refreshToken");

function decodeBase64Url(part) {
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

function readUser() {
    const token = localStorage.getItem(ACCESS_KEY);
    if (!token) {
        return null;
    }
    try {
        const payload = JSON.parse(decodeBase64Url(token.split(".")[1]));
        return {username: payload.sub, role: payload.role};
    } catch {
        return null;
    }
}

export const user = writable(readUser());

export function getAccessToken() {
    return localStorage.getItem(ACCESS_KEY);
}

export function saveTokens(tokens) {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    user.set(readUser());
}

export function clearTokens() {
    localStorage.removeItem(ACCESS_KEY);
    user.set(null);
}

fromEvent(window, "storage")
    .pipe(filter(event => event.key === ACCESS_KEY || event.key === null))
    .subscribe(() => user.set(readUser()));
