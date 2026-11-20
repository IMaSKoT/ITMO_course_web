import test from "node:test";
import assert from "node:assert/strict";
import {mkdtemp, readFile, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";

test("Журнал восстанавливается с диска и не дублирует одновременные события", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "lab6-journal-"));
    process.env.DATA_DIR = dir;
    try {
        const old = {id: "old", action: "CREATE"};
        await writeFile(path.join(dir, "journal.jsonl"), JSON.stringify(old) + '\n{"broken":');
        const {loadJournal, addEntry, getJournalPage} = await import("../src/journal.js");
        await loadJournal();
        const entry = {id: "new", action: "UPDATE"};
        const result = await Promise.all([addEntry(entry), addEntry(entry)]);
        assert.deepEqual(result, [true, false]);
        assert.deepEqual(getJournalPage(1, 1).items, [entry]);
        assert.deepEqual(getJournalPage(2, 1).items, [old]);
        assert.deepEqual(getJournalPage(3, 1).items, []);
        const lines = (await readFile(path.join(dir, "journal.jsonl"), "utf-8")).trim().split("\n");
        assert.deepEqual(lines.map(JSON.parse), [old, entry]);
    } finally {
        await rm(dir, {recursive: true, force: true});
    }
});
