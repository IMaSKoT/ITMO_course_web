import crypto from "node:crypto";
import {JWT_ISSUER, JWT_SECRET} from "./config.js";

export function safeEqual(first, second) {
    const a = Buffer.from(String(first));
    const b = Buffer.from(String(second));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function decodePart(part) {
    return JSON.parse(Buffer.from(part, "base64url").toString());
}

export function verifyToken(token) {
    const parts = String(token ?? "").split(".");
    if (parts.length !== 3) {
        return null;
    }
    const [header, payload, signature] = parts;
    const expected = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest("base64url");
    if (!safeEqual(signature, expected)) {
        return null;
    }
    try {
        const head = decodePart(header);
        const claims = decodePart(payload);
        if (head.alg !== "HS256" || claims.iss !== JWT_ISSUER || !claims.sub || !claims.role) {
            return null;
        }
        if (typeof claims.exp !== "number" || !Number.isFinite(claims.exp) || claims.exp <= Date.now() / 1000) {
            return null;
        }
        if (typeof claims.sub !== "string" || !["USER", "ADMIN"].includes(claims.role)) {
            return null;
        }
        return {username: claims.sub, role: claims.role, exp: claims.exp, token};
    } catch {
        return null;
    }
}

function readCookie(req, name) {
    for (const part of (req.headers.cookie ?? "").split(";")) {
        const [key, ...value] = part.trim().split("=");
        if (key === name) {
            return value.join("=");
        }
    }
    return null;
}

export function getUser(req) {
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : readCookie(req, "accessToken");
    return verifyToken(token);
}
