import {publicRequest, request} from "./http.js";
import {saveTokens} from "../stores/auth.js";

export async function login({username, password}, signal) {
    saveTokens(await publicRequest("/auth/login", {username, password}, signal));
}

export async function register({username, email, password}, signal) {
    await publicRequest("/auth/register", {username, email, password}, signal);
    await login({username, password}, signal);
}

export function getMe(signal) {
    return request("/auth/me", {signal});
}
