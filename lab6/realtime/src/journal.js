import {appendFile, mkdir, readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {DATA_DIR} from "./config.js";

const JOURNAL_FILE = path.join(DATA_DIR, "journal.jsonl");

const entries = [];
const ids = new Set();
let writing = Promise.resolve();

export async function loadJournal() {
    await mkdir(DATA_DIR, {recursive: true});
    let text = "";
    try {
        text = await readFile(JOURNAL_FILE, "utf-8");
    } catch (err) {
        if (err.code !== "ENOENT") {
            throw err;
        }
    }
    let damaged = false;
    for (const line of text.split("\n")) {
        if (line.trim() === "") {
            continue;
        }
        try {
            const entry = JSON.parse(line);
            if (ids.has(entry.id)) {
                continue;
            }
            entries.push(entry);
            ids.add(entry.id);
        } catch {
            damaged = true;
            console.warn("Журнал: пропущена повреждённая строка");
        }
    }
    if (damaged || (text && !text.endsWith("\n"))) {
        await writeFile(JOURNAL_FILE, entries.map(entry => JSON.stringify(entry) + "\n").join(""));
    }
    console.log(`Журнал загружен: ${entries.length} записей`);
}

export function hasEntry(id) {
    return ids.has(id);
}

export function addEntry(entry) {
    writing = writing.catch(() => {}).then(async () => {
        if (ids.has(entry.id)) {
            return false;
        }
        await appendFile(JOURNAL_FILE, JSON.stringify(entry) + "\n", {flush: true});
        ids.add(entry.id);
        entries.push(entry);
        return true;
    });
    return writing;
}

export function getJournalPage(page, size) {
    const totalItems = entries.length;
    const totalPages = Math.ceil(totalItems / size);
    const end = totalItems - (page - 1) * size;
    const items = entries.slice(Math.max(end - size, 0), Math.max(end, 0)).reverse();
    return {items, page, size, totalItems, totalPages};
}
