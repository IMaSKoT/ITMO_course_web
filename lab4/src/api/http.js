import {defer, finalize, firstValueFrom, shareReplay, switchMap, tap} from "rxjs";
import {clearTokens, getAccessToken, getRefreshToken, saveTokens} from "../stores/auth.js";
import {showNotice} from "../stores/notice.js";

const API_URL = "/api";
const SERVER_DOWN = "Сервер недоступен, попробуйте позже";
const SESSION_EXPIRED = "Сессия истекла, войдите заново";

const STATUS_MESSAGES = {
    401: "Нужно войти в систему",
    403: "Недостаточно прав для этой операции",
    404: "Данные не найдены",
    422: "Некорректные данные",
    500: "Внутренняя ошибка сервера",
    502: SERVER_DOWN,
    503: SERVER_DOWN,
    504: SERVER_DOWN,
};

export class ApiError extends Error {
    constructor(status, code, message, details = []) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

async function toError(response) {
    let body = null;
    try {
        body = await response.json();
    } catch {
        body = null;
    }
    const error = body?.error;
    return new ApiError(
        response.status,
        error?.code ?? "HTTP_ERROR",
        error?.message ?? STATUS_MESSAGES[response.status] ?? `Ошибка сервера (${response.status})`,
        error?.details ?? []
    );
}

async function send(path, options, token) {
    const headers = {};
    if (options.body !== undefined) {
        headers["Content-Type"] = "application/json";
    }
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    try {
        return await fetch(API_URL + path, {
            method: options.method ?? "GET",
            headers: headers,
            body: options.body === undefined ? undefined : JSON.stringify(options.body),
            signal: options.signal,
        });
    } catch (error) {
        if (error.name === "AbortError") {
            throw error;
        }
        throw new ApiError(0, "NETWORK_ERROR", SERVER_DOWN);
    }
}

async function readResponse(response) {
    if (!response.ok) {
        throw await toError(response);
    }
    if (response.status === 204) {
        return null;
    }
    return response.json();
}

let refreshing$ = null;

function refreshTokens() {
    if (!refreshing$) {
        refreshing$ = defer(() => send("/auth/refresh", {method: "POST", body: {refreshToken: getRefreshToken()}})).pipe(
            switchMap(readResponse),
            tap(saveTokens),
            finalize(() => {
                refreshing$ = null;
            }),
            shareReplay(1)
        );
    }
    return firstValueFrom(refreshing$);
}

function expireSession() {
    clearTokens();
    showNotice(SESSION_EXPIRED, true);
    return new ApiError(401, "SESSION_EXPIRED", SESSION_EXPIRED);
}

async function updateToken(usedToken) {
    const storedToken = getAccessToken();
    if (storedToken && storedToken !== usedToken) {
        return;
    }
    if (!getRefreshToken()) {
        throw expireSession();
    }
    try {
        await refreshTokens();
    } catch (error) {
        throw error.status === 401 ? expireSession() : error;
    }
}

export async function request(path, options = {}) {
    const usedToken = getAccessToken();
    let response = await send(path, options, usedToken);
    if (response.status === 401) {
        await updateToken(usedToken);
        response = await send(path, options, getAccessToken());
        if (response.status === 401) {
            throw expireSession();
        }
    }
    return readResponse(response);
}

export async function publicRequest(path, body, signal) {
    return readResponse(await send(path, {method: "POST", body, signal}));
}
