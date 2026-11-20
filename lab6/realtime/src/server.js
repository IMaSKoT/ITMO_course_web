import http from "node:http";
import {ALLOWED_ORIGIN, PORT, checkConfig} from "./config.js";
import {getUser} from "./auth.js";
import {HttpError, sendError, sendJson} from "./http.js";
import {getJournalPage, loadJournal} from "./journal.js";
import {receiveEvent} from "./events.js";
import {exportCsv, getImport, importCsv} from "./transfer.js";
import {acceptOffer, clientCount, startHeartbeat} from "./webrtc.js";

function readNumber(url, name, defaultValue, max) {
    const value = Number(url.searchParams.get(name) ?? defaultValue);
    if (!Number.isInteger(value) || value < 1 || value > max) {
        throw new HttpError(422, `Параметр ${name} должен быть целым числом от 1 до ${max}`);
    }
    return value;
}

async function route(req, res, url) {
    const key = `${req.method} ${url.pathname}`;
    if (key === "GET /health") {
        sendJson(res, 200, {status: "ok", clients: clientCount()});
        return;
    }
    if (key === "POST /internal/events") {
        await receiveEvent(req, res);
        return;
    }
    const user = getUser(req);
    if (!user) {
        throw new HttpError(401, "Нужно войти в систему");
    }
    if (user.role !== "ADMIN") {
        throw new HttpError(403, "Недостаточно прав для этой операции");
    }
    if (req.method === "POST" && req.headers.origin !== ALLOWED_ORIGIN
        && !req.headers.authorization?.startsWith("Bearer ")) {
        throw new HttpError(403, "Недопустимый источник запроса");
    }
    if (key === "POST /import") {
        await importCsv(req, res, user);
        return;
    }
    if (key === "POST /rtc/offer") {
        await acceptOffer(req, res, user);
        return;
    }
    if (req.method === "GET" && url.pathname.startsWith("/imports/")) {
        getImport(res, url.pathname.slice("/imports/".length));
        return;
    }
    if (key === "GET /export") {
        await exportCsv(res, user);
        return;
    }
    if (key === "GET /journal") {
        sendJson(res, 200, getJournalPage(readNumber(url, "page", 1, 100000), readNumber(url, "size", 20, 100)));
        return;
    }
    throw new HttpError(404, "Данные не найдены");
}

checkConfig();
await loadJournal();

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    try {
        await route(req, res, url);
    } catch (err) {
        if (res.headersSent) {
            console.error(err);
            res.destroy();
        } else if (err instanceof HttpError) {
            sendError(res, err.status, err.message, err.details);
        } else {
            console.error(err);
            sendError(res, 500, "Внутренняя ошибка сервиса");
        }
    }
});

startHeartbeat();

server.listen(PORT, () => {
    console.log(`Сервис реального времени запущен на порту ${PORT}`);
});
