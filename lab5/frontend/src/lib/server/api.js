import {error, fail, redirect} from "@sveltejs/kit";
import {cached, clearCache} from "./cache.js";
import {clearSession} from "./session.js";

const API_URL = `${process.env.BACKEND_URL ?? "http://localhost:8080"}/api`;
const SERVER_DOWN = "Сервер недоступен, попробуйте позже";

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
    constructor(status, message, details = []) {
        super(message);
        this.status = status;
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
        error?.message ?? STATUS_MESSAGES[response.status] ?? `Ошибка сервера (${response.status})`,
        error?.details ?? []
    );
}

async function send(path, {method = "GET", body, token, refreshToken} = {}) {
    const headers = {};
    if (body !== undefined) {
        headers["Content-Type"] = "application/json";
    }
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    if (refreshToken) {
        headers.Cookie = `refreshToken=${refreshToken}`;
    }
    let response;
    try {
        response = await fetch(API_URL + path, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    } catch {
        throw new ApiError(503, SERVER_DOWN);
    }
    if (!response.ok) {
        throw await toError(response);
    }
    return response;
}

async function request(path, options) {
    const response = await send(path, options);
    return response.status === 204 ? null : response.json();
}

async function requestTokens(path, options) {
    const response = await send(path, {method: "POST", ...options});
    const {accessToken} = await response.json();
    const cookie = response.headers.getSetCookie().find(value => value.startsWith("refreshToken="));
    const refreshToken = cookie.split(";")[0].slice("refreshToken=".length);
    return {accessToken, refreshToken};
}

export function login(username, password) {
    return requestTokens("/auth/login", {body: {username, password}});
}

export function register(username, email, password) {
    return request("/auth/register", {method: "POST", body: {username, email, password}});
}

const refreshing = new Map();

export function refresh(refreshToken) {
    if (!refreshing.has(refreshToken)) {
        const tokens = requestTokens("/auth/refresh", {refreshToken})
            .finally(() => setTimeout(() => refreshing.delete(refreshToken), 10000));
        refreshing.set(refreshToken, tokens);
    }
    return refreshing.get(refreshToken);
}

export function logout(refreshToken) {
    return request("/auth/logout", {method: "POST", refreshToken});
}

export function getMe(token) {
    return request("/auth/me", {token});
}

export function getStudents(token, params) {
    return cached(`${token}:students:${JSON.stringify(params)}`, () =>
        request("/students", {method: "QUERY", body: params, token})
    );
}

export function getStudent(token, isuId) {
    return cached(`${token}:student:${isuId}`, () => request(`/students/${isuId}`, {token}));
}

export async function createStudent(token, student) {
    await request("/students", {method: "POST", body: student, token});
    clearCache();
}

export async function replaceStudent(token, isuId, student) {
    await request(`/students/${isuId}`, {method: "PUT", body: student, token});
    clearCache();
}

export async function deleteStudent(token, isuId) {
    await request(`/students/${isuId}`, {method: "DELETE", token});
    clearCache();
}

export function pageError(err, cookies) {
    if (!(err instanceof ApiError)) {
        throw err;
    }
    if (err.status === 401) {
        clearSession(cookies);
        redirect(303, "/login");
    }
    error(err.status, err.message);
}

export function formError(err, values) {
    if (!(err instanceof ApiError)) {
        throw err;
    }
    return fail(err.status, {error: {message: err.message, details: err.details}, values});
}
