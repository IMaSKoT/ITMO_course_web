export class HttpError extends Error {
    constructor(status, message, details = []) {
        super(message);
        this.status = status;
        this.details = details;
    }
}

export function sendJson(res, status, body) {
    res.writeHead(status, {"Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store"});
    res.end(JSON.stringify(body));
}

export function sendError(res, status, message, details = []) {
    sendJson(res, status, {error: {message, details}});
}

export async function readBody(req, limit) {
    const chunks = [];
    let size = 0;
    for await (const chunk of req.iterator({destroyOnReturn: false})) {
        size += chunk.length;
        if (size > limit) {
            req.resume();
            throw new HttpError(413, `Слишком большой запрос, максимум ${Math.round(limit / 1024)} КБ`);
        }
        chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
}

export function parseJson(text) {
    try {
        return JSON.parse(text);
    } catch {
        throw new HttpError(400, "Некорректный JSON");
    }
}
