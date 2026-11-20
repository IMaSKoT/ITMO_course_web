export const PORT = Number(process.env.PORT ?? 4000);
export const BACKEND_URL = `${process.env.BACKEND_URL ?? "http://localhost:8080"}/api`;
export const JWT_SECRET = process.env.JWT_SECRET ?? "";
export const JWT_ISSUER = process.env.JWT_ISSUER ?? "dormitory-app";
export const SERVICE_TOKEN = process.env.REALTIME_TOKEN ?? "";
export const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:3000";
export const DATA_DIR = process.env.DATA_DIR ?? "data";
export const RTC_HOST = process.env.RTC_HOST ?? "";
export const RTC_PORT_MIN = Number(process.env.RTC_PORT_MIN ?? 50000);
export const RTC_PORT_MAX = Number(process.env.RTC_PORT_MAX ?? 50020);

export function checkConfig() {
    if (JWT_SECRET.length < 32) {
        throw new Error("JWT_SECRET должен быть не короче 32 символов");
    }
    if (SERVICE_TOKEN.length < 16) {
        throw new Error("REALTIME_TOKEN должен быть не короче 16 символов");
    }
    if (!Number.isInteger(RTC_PORT_MIN) || !Number.isInteger(RTC_PORT_MAX)
        || RTC_PORT_MIN < 1024 || RTC_PORT_MAX > 65535 || RTC_PORT_MIN >= RTC_PORT_MAX) {
        throw new Error("Укажите корректный диапазон портов WebRTC");
    }
}
