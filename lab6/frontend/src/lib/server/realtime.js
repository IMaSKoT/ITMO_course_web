import {ApiError} from "./api.js";

const REALTIME_URL = process.env.REALTIME_URL ?? "http://localhost:4000";

export async function getJournal(token, page, size) {
    let response;
    try {
        response = await fetch(`${REALTIME_URL}/journal?page=${page}&size=${size}`, {
            headers: {Authorization: `Bearer ${token}`},
            signal: AbortSignal.timeout(5000),
        });
    } catch {
        throw new ApiError(503, "Сервис журнала недоступен, попробуйте позже");
    }
    const data = await response.json();
    if (!response.ok) {
        throw new ApiError(response.status, data.error?.message ?? "Не удалось загрузить журнал");
    }
    return data;
}
