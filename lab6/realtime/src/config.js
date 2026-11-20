export const PORT = Number(process.env.PORT ?? 4000);
export const BACKEND_URL = `${process.env.BACKEND_URL ?? "http://localhost:8080"}/api`;
export const JWT_SECRET = process.env.JWT_SECRET ?? "";
export const JWT_ISSUER = process.env.JWT_ISSUER ?? "dormitory-app";
export const SERVICE_TOKEN = process.env.REALTIME_TOKEN ?? "";
export const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? "";
export const DATA_DIR = process.env.DATA_DIR ?? "data";

export function checkConfig() {
    if (JWT_SECRET.length < 32) {
        throw new Error("JWT_SECRET должен быть не короче 32 символов");
    }
    if (SERVICE_TOKEN.length < 16) {
        throw new Error("REALTIME_TOKEN должен быть не короче 16 символов");
    }
}
