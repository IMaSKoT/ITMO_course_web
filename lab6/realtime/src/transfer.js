import {randomUUID} from "node:crypto";
import {Readable} from "node:stream";
import {pipeline} from "node:stream/promises";
import {backendRequest} from "./backend.js";
import {COLUMNS, csvLine, parseCsv, toStudent} from "./csv.js";
import {HttpError, readBody, sendJson} from "./http.js";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const jobs = new Map();
let importing = false;

async function runImport(job, rows, token) {
    const seen = new Set();
    job.status = "running";
    try {
        for (let i = 0; i < rows.length; i++) {
            try {
                const student = toStudent(rows[i]);
                if (seen.has(student.isuId)) {
                    throw new HttpError(409, "Номер ИСУ повторяется в файле");
                }
                seen.add(student.isuId);
                await backendRequest("/students", token, "POST", student);
                job.created++;
            } catch (err) {
                job.errors.push({row: i + 2, status: err.status ?? 500, message: err.message, details: err.details ?? []});
                if (!err.status || err.status === 401 || err.status === 403 || err.status >= 500) {
                    job.processed++;
                    throw err;
                }
            }
            job.processed++;
        }
        job.status = job.errors.length ? "completed-with-errors" : "completed";
    } catch (err) {
        job.status = "failed";
        job.message = err.message;
    } finally {
        importing = false;
        job.finishedAt = new Date().toISOString();
    }
}

export async function importCsv(req, res, user) {
    if (importing) {
        throw new HttpError(409, "Другой импорт ещё выполняется, попробуйте позже");
    }
    if (!req.headers["content-type"]?.startsWith("text/csv")) {
        throw new HttpError(415, "Отправьте CSV с Content-Type: text/csv");
    }
    importing = true;
    let rows;
    try {
        rows = await parseCsv(await readBody(req, MAX_FILE_SIZE));
    } catch (err) {
        importing = false;
        throw err;
    }
    const job = {
        id: randomUUID(), username: user.username, status: "queued",
        total: rows.length, processed: 0, created: 0, errors: [],
    };
    if (jobs.size >= 20) {
        jobs.delete(jobs.keys().next().value);
    }
    jobs.set(job.id, job);
    sendJson(res, 202, job);
    void runImport(job, rows, user.token);
}

export function getImport(res, id) {
    const job = jobs.get(id);
    if (!job) {
        throw new HttpError(404, "Задание не найдено. После перезапуска сервиса проверьте результат в журнале");
    }
    sendJson(res, 200, job);
}

export async function exportCsv(res, user) {
    const students = await backendRequest("/students/snapshot", user.token);
    async function* lines() {
        yield "\uFEFF" + csvLine(COLUMNS);
        for (const student of students) {
            yield csvLine(COLUMNS.map(column => student[column]));
        }
    }
    res.writeHead(200, {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="students.csv"',
        "Cache-Control": "no-store",
    });
    await pipeline(Readable.from(lines()), res);
}
