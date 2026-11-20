import test from "node:test";
import assert from "node:assert/strict";
import {COLUMNS, MAX_ROWS, csvLine, parseCsv, toStudent} from "../src/csv.js";

const student = ["Иванов Иван", "P3210", "123456", "", "", "", "false", 'Запятая, кавычка " и\r\nновая строка'];

test("CSV сохраняет кириллицу, BOM, кавычки, запятые и переносы строк", async () => {
    const text = "\uFEFF" + csvLine(COLUMNS) + csvLine(student);
    const rows = await parseCsv(text);
    assert.deepEqual(rows, [student]);
    assert.deepEqual(toStudent(rows[0]), {
        fullName: "Иванов Иван", group: "P3210", isuId: 123456,
        dormitory: null, room: null, settlementPeriod: null, isForeign: false, notes: student[7],
    });
});

test("CSV принимает LF и последнюю строку без переноса", async () => {
    const rows = await parseCsv(COLUMNS.join(",") + "\n" + student.slice(0, 7).join(",") + ",");
    assert.equal(rows.length, 1);
    assert.equal(rows[0].length, 8);
    assert.equal(toStudent(rows[0]).notes, null);
});

test("CSV отклоняет повреждённую структуру до импорта", async () => {
    for (const text of ["", "wrong\nheader", csvLine(COLUMNS), csvLine(COLUMNS) + '"незакрыто',
        csvLine(COLUMNS) + '"поле"лишнее,1', csvLine(COLUMNS) + 'поле"кавычка,1']) {
        await assert.rejects(parseCsv(text), {status: 422});
    }
});

test("CSV ограничивает число записей", async () => {
    await assert.rejects(parseCsv(csvLine(COLUMNS) + csvLine(student).repeat(MAX_ROWS + 1)), {status: 422});
});

test("CSV не превращает ошибочные числа и булевы значения в допустимые", () => {
    for (const [index, value] of [[2, ""], [2, "123e3"], [3, "1.5"], [6, "0"]]) {
        const row = [...student];
        row[index] = value;
        assert.throws(() => toStudent(row), {status: 422});
    }
    assert.throws(() => toStudent(["Иванов Иван"]), {status: 422});
});
