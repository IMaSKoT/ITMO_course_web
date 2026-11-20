import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

process.env.JWT_SECRET = "test-secret-for-lab6-at-least-32-characters";
const {verifyToken, getUser} = await import("../src/auth.js");

function token(changes = {}, algorithm = "HS256") {
    const head = Buffer.from(JSON.stringify({alg: algorithm})).toString("base64url");
    const body = Buffer.from(JSON.stringify({
        iss: "dormitory-app", sub: "admin", role: "ADMIN", exp: Math.floor(Date.now() / 1000) + 60, ...changes,
    })).toString("base64url");
    const signature = crypto.createHmac("sha256", process.env.JWT_SECRET).update(`${head}.${body}`).digest("base64url");
    return `${head}.${body}.${signature}`;
}

test("JWT принимается из Bearer и HttpOnly cookie", () => {
    const value = token();
    assert.equal(getUser({headers: {authorization: `Bearer ${value}`}}).role, "ADMIN");
    assert.equal(getUser({headers: {cookie: `other=1; accessToken=${value}`}}).username, "admin");
});

test("JWT отклоняет подделку, истечение, другой алгоритм и некорректные claims", () => {
    for (const value of ["", "a.b.c", token() + "x", token({exp: 1}), token({exp: "tomorrow"}),
        token({iss: "other"}), token({role: "ROOT"}), token({}, "none")]) {
        assert.equal(verifyToken(value), null);
    }
});
