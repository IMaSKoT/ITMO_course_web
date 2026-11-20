import http from "node:http";
import {ALLOWED_ORIGIN, PORT, checkConfig} from "./config.js";
import {getUser} from "./auth.js";
import {HttpError, sendError, sendJson} from "./http.js";
import {acceptWebSocket, clientCount, rejectUpgrade, startHeartbeat} from "./websocket.js";

async function route(req, res, url) {
    const key = `${req.method} ${url.pathname}`;
    if (key === "GET /health") {
        sendJson(res, 200, {status: "ok", clients: clientCount()});
        return;
    }
    const user = getUser(req);
    if (!user) {
        throw new HttpError(401, "Нужно войти в систему");
    }
    throw new HttpError(404, "Данные не найдены");
}

function handleUpgrade(req, socket) {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname !== "/ws") {
        rejectUpgrade(socket, 404, "Not Found");
        return;
    }
    if (ALLOWED_ORIGIN && req.headers.origin !== ALLOWED_ORIGIN) {
        rejectUpgrade(socket, 403, "Forbidden");
        return;
    }
    const user = getUser(req);
    if (!user) {
        rejectUpgrade(socket, 401, "Unauthorized");
        return;
    }
    if (user.role !== "ADMIN") {
        rejectUpgrade(socket, 403, "Forbidden");
        return;
    }
    acceptWebSocket(req, socket, user);
}

checkConfig();

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

server.on("upgrade", handleUpgrade);
startHeartbeat();

server.listen(PORT, () => {
    console.log(`Сервис реального времени запущен на порту ${PORT}`);
});
