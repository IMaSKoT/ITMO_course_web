const API_URL = "/api";
const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export class ApiError extends Error {
    constructor(status, code, message, details = []) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

function saveTokens(tokens) {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
}

function clearTokens() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
}

function decodeBase64Url(part) {
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

// имя и роль берём из payload access-токена, подпись проверяет только сервер
export function currentUser() {
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

export function isAdmin() {
    return currentUser()?.role === "ADMIN";
}

export function redirectToLogin() {
    const next = encodeURIComponent(location.pathname + location.search);
    location.href = `login.html?next=${next}`;
}

export function logout() {
    clearTokens();
    location.href = "login.html";
}

async function toError(response) {
    let body = null;
    try {
        body = await response.json();
    } catch {
        // тело не json, например страница ошибки сервера
    }
    const error = body?.error;
    return new ApiError(
        response.status,
        error?.code ?? "HTTP_ERROR",
        error?.message ?? `Ошибка сервера (${response.status})`,
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
        });
    } catch {
        throw new ApiError(0, "NETWORK_ERROR", "Сервер недоступен, проверьте, что бэкенд запущен");
    }
}

// refresh-токен одноразовый, поэтому параллельные запросы ждут одно обновление
let refreshing = null;

function refreshTokens() {
    if (!refreshing) {
        refreshing = doRefresh().finally(() => {
            refreshing = null;
        });
    }
    return refreshing;
}

async function doRefresh() {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) {
        return false;
    }
    const response = await send("/auth/refresh", {method: "POST", body: {refreshToken}});
    if (!response.ok) {
        return false;
    }
    saveTokens(await response.json());
    return true;
}

async function request(path, options = {}) {
    const usedToken = localStorage.getItem(ACCESS_KEY);
    let response = await send(path, options, usedToken);

    if (response.status === 401) {
        // токен могла уже обновить другая вкладка
        const storedToken = localStorage.getItem(ACCESS_KEY);
        if ((storedToken && storedToken !== usedToken) || await refreshTokens()) {
            response = await send(path, options, localStorage.getItem(ACCESS_KEY));
        }
    }
    if (response.status === 401) {
        clearTokens();
        redirectToLogin();
    }
    if (!response.ok) {
        throw await toError(response);
    }
    if (response.status === 204) {
        return null;
    }
    return response.json();
}

async function publicRequest(path, body) {
    const response = await send(path, {method: "POST", body: body});
    if (!response.ok) {
        throw await toError(response);
    }
    return response.json();
}

export async function login(username, password) {
    saveTokens(await publicRequest("/auth/login", {username, password}));
}

export async function register(user) {
    return publicRequest("/auth/register", user);
}

export async function getStudents(params) {
    const query = new URLSearchParams(params).toString();
    return request(`/students?${query}`);
}

export async function getStudent(isuId) {
    return request(`/students/${isuId}`);
}

export async function createStudent(student) {
    return request("/students", {method: "POST", body: student});
}

export async function replaceStudent(isuId, student) {
    return request(`/students/${isuId}`, {method: "PUT", body: student});
}

export async function deleteStudent(isuId) {
    return request(`/students/${isuId}`, {method: "DELETE"});
}
