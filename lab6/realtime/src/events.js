import {SERVICE_TOKEN} from "./config.js";
import {safeEqual} from "./auth.js";
import {HttpError, parseJson, readBody, sendJson} from "./http.js";
import {addEntry, hasEntry} from "./journal.js";
import {broadcast} from "./webrtc.js";

const STUDENT_ACTIONS = ["CREATE", "UPDATE", "DELETE"];
const MAX_EVENT_SIZE = 64 * 1024;

export async function publish(entry) {
    if (await addEntry(entry)) {
        broadcast({type: "journal-entry", entry});
    }
}

function describe(event) {
    if (event.action === "UPDATE" && event.student.isuId !== event.isuId) {
        return `ИСУ изменён на ${event.student.isuId}`;
    }
    return null;
}

export async function receiveEvent(req, res) {
    if (!safeEqual(req.headers["x-service-token"] ?? "", SERVICE_TOKEN)) {
        throw new HttpError(401, "Неверный служебный токен");
    }
    const event = parseJson(await readBody(req, MAX_EVENT_SIZE));
    if (!event || typeof event.id !== "string" || !event.id || !STUDENT_ACTIONS.includes(event.action)
        || typeof event.username !== "string" || !event.username || !event.student
        || !Number.isInteger(event.isuId) || typeof event.student.fullName !== "string") {
        throw new HttpError(422, "Некорректное событие");
    }
    if (hasEntry(event.id)) {
        sendJson(res, 200, {status: "duplicate"});
        return;
    }
    await publish({
        id: event.id,
        time: event.time ?? new Date().toISOString(),
        action: event.action,
        username: event.username,
        isuId: event.isuId,
        fullName: event.student.fullName,
        details: describe(event),
    });
    sendJson(res, 200, {status: "saved"});
}
