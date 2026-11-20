import {BACKEND_URL} from "./config.js";
import {HttpError} from "./http.js";

export async function backendRequest(path, token, method = "GET", body) {
    let response;
    try {
        response = await fetch(BACKEND_URL + path, {
            method,
            headers: {Authorization: `Bearer ${token}`, "Content-Type": "application/json"},
            body: body === undefined ? undefined : JSON.stringify(body),
            signal: AbortSignal.timeout(15000),
        });
    } catch {
        throw new HttpError(503, "Java-сервер недоступен. Результат последней операции неизвестен, проверьте журнал");
    }
    const data = response.status === 204 ? null : await response.json();
    if (!response.ok) {
        throw new HttpError(response.status, data?.error?.message ?? "Ошибка Java-сервера", data?.error?.details);
    }
    return data;
}
