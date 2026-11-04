import {writable} from "svelte/store";
import {filter, fromEvent} from "rxjs";

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

function decodeBase64Url(part) {
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

function readUser() {
    const token = localStorage.getItem(ACCESS_KEY);
    if (!token || !localStorage.getItem(REFRESH_KEY)) {
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

export function getRefreshToken() {
    return localStorage.getItem(REFRESH_KEY);
}

export function saveTokens(tokens) {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    user.set(readUser());
}

export function clearTokens() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    user.set(null);
}

fromEvent(window, "storage")
    .pipe(filter(event => event.key === ACCESS_KEY || event.key === REFRESH_KEY || event.key === null))
    .subscribe(() => user.set(readUser()));
