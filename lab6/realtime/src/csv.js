import {setImmediate} from "node:timers/promises";
import {HttpError} from "./http.js";

export const COLUMNS = ["fullName", "group", "isuId", "dormitory", "room", "settlementPeriod", "isForeign", "notes"];
export const MAX_ROWS = 2000;

export async function parseCsv(text) {
    text = text.replace(/^\uFEFF/, "");
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;
    let closed = false;
    for (let i = 0; i < text.length; i++) {
        if (i % 16384 === 0) {
            await setImmediate();
        }
        const char = text[i];
        if (quoted) {
            if (char === '"' && text[i + 1] === '"') {
                field += '"';
                i++;
            } else if (char === '"') {
                quoted = false;
                closed = true;
            } else {
                field += char;
            }
        } else if (char === ',' || char === '\n' || char === '\r') {
            row.push(field);
            field = "";
            closed = false;
            if (char !== ',') {
                if (row.length > 1 || row[0] !== "") {
                    rows.push(row);
                }
                row = [];
                if (char === '\r' && text[i + 1] === '\n') {
                    i++;
                }
            }
        } else if (char === '"' && field === "" && !closed) {
            quoted = true;
        } else if (closed || char === '"') {
            throw new HttpError(422, "Некорректные кавычки в CSV");
        } else {
            field += char;
        }
        if (rows.length > MAX_ROWS + 1) {
            throw new HttpError(422, `Не больше ${MAX_ROWS} студентов в одном файле`);
        }
    }
    if (quoted) {
        throw new HttpError(422, "В CSV не закрыты кавычки");
    }
    if (field !== "" || row.length > 0 || closed) {
        rows.push([...row, field]);
    }
    const header = rows.shift();
    if (!header || header.length !== COLUMNS.length || !COLUMNS.every((column, i) => header[i] === column)) {
        throw new HttpError(422, `Заголовок CSV должен быть: ${COLUMNS.join(",")}`);
    }
    if (rows.length === 0 || rows.length > MAX_ROWS) {
        throw new HttpError(422, `В файле должно быть от 1 до ${MAX_ROWS} студентов`);
    }
    return rows;
}

function number(value, optional = false) {
    if (optional && value === "") {
        return null;
    }
    if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) {
        throw new HttpError(422, `Ожидалось целое число, получено «${value}»`);
    }
    return Number(value);
}

export function toStudent(row) {
    if (row.length !== COLUMNS.length) {
        throw new HttpError(422, `Ожидалось ${COLUMNS.length} полей, получено ${row.length}`);
    }
    const [fullName, group, isuId, dormitory, room, settlementPeriod, isForeign, notes] = row;
    if (!["true", "false"].includes(isForeign)) {
        throw new HttpError(422, "isForeign должен быть true или false");
    }
    return {
        fullName,
        group,
        isuId: number(isuId),
        dormitory: number(dormitory, true),
        room: number(room, true),
        settlementPeriod: settlementPeriod || null,
        isForeign: isForeign === "true",
        notes: notes || null,
    };
}

export function csvLine(values) {
    return values.map(value => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",") + "\r\n";
}
