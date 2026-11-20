import crypto from "node:crypto";

const WEBSOCKET_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
const PING_INTERVAL = 30000;
const MAX_MESSAGE_SIZE = 64 * 1024;
const MAX_BUFFERED = 1024 * 1024;

const OPCODE = {
    TEXT: 0x1,
    CLOSE: 0x8,
    PING: 0x9,
    PONG: 0xa,
};

const clients = new Set();

function sendFrame(socket, opcode, payload = Buffer.alloc(0)) {
    let header;
    if (payload.length < 126) {
        header = Buffer.from([0x80 | opcode, payload.length]);
    } else if (payload.length < 65536) {
        header = Buffer.alloc(4);
        header[0] = 0x80 | opcode;
        header[1] = 126;
        header.writeUInt16BE(payload.length, 2);
    } else {
        header = Buffer.alloc(10);
        header[0] = 0x80 | opcode;
        header[1] = 127;
        header.writeBigUInt64BE(BigInt(payload.length), 2);
    }
    socket.write(Buffer.concat([header, payload]));
}

function readFrame(buffer) {
    if (buffer.length < 2) {
        return null;
    }
    const opcode = buffer[0] & 0x0f;
    const masked = (buffer[1] & 0x80) !== 0;
    let length = buffer[1] & 0x7f;
    let offset = 2;
    if (length === 126) {
        if (buffer.length < 4) {
            return null;
        }
        length = buffer.readUInt16BE(2);
        offset = 4;
    } else if (length === 127) {
        if (buffer.length < 10) {
            return null;
        }
        length = Number(buffer.readBigUInt64BE(2));
        offset = 10;
    }
    const maskSize = masked ? 4 : 0;
    const size = offset + maskSize + length;
    if (buffer.length < size) {
        return {opcode, length, complete: false};
    }
    const mask = buffer.subarray(offset, offset + maskSize);
    const payload = Buffer.from(buffer.subarray(offset + maskSize, size));
    if (masked) {
        for (let i = 0; i < payload.length; i++) {
            payload[i] ^= mask[i % 4];
        }
    }
    return {opcode, length, payload, size, complete: true};
}

function sendMessage(client, message) {
    sendFrame(client.socket, OPCODE.TEXT, Buffer.from(JSON.stringify(message)));
}

function closeClient(client, code, reason) {
    if (!clients.delete(client)) {
        return;
    }
    const payload = Buffer.alloc(2 + Buffer.byteLength(reason));
    payload.writeUInt16BE(code, 0);
    payload.write(reason, 2);
    sendFrame(client.socket, OPCODE.CLOSE, payload);
    client.socket.end();
}

function handleFrame(client, frame) {
    if (frame.opcode === OPCODE.CLOSE) {
        closeClient(client, 1000, "Bye");
    } else if (frame.opcode === OPCODE.PING) {
        sendFrame(client.socket, OPCODE.PONG, frame.payload);
    } else if (frame.opcode === OPCODE.PONG) {
        client.alive = true;
    } else if (frame.opcode === OPCODE.TEXT) {
        client.alive = true;
    }
}

export function rejectUpgrade(socket, status, text) {
    socket.write(`HTTP/1.1 ${status} ${text}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
    socket.destroy();
}

export function acceptWebSocket(req, socket, user) {
    const key = req.headers["sec-websocket-key"];
    if (req.headers.upgrade?.toLowerCase() !== "websocket" || req.headers["sec-websocket-version"] !== "13" || !key) {
        rejectUpgrade(socket, 400, "Bad Request");
        return;
    }
    const accept = crypto.createHash("sha1").update(key + WEBSOCKET_GUID).digest("base64");
    socket.write([
        "HTTP/1.1 101 Switching Protocols",
        "Upgrade: websocket",
        "Connection: Upgrade",
        `Sec-WebSocket-Accept: ${accept}`,
        "",
        "",
    ].join("\r\n"));

    const client = {socket, user, alive: true};
    clients.add(client);
    console.log(`WebSocket: подключился ${user.username}, всего ${clients.size}`);

    let buffer = Buffer.alloc(0);
    socket.on("data", chunk => {
        buffer = Buffer.concat([buffer, chunk]);
        let frame = readFrame(buffer);
        while (frame) {
            if (frame.length > MAX_MESSAGE_SIZE) {
                closeClient(client, 1009, "Message too big");
                return;
            }
            if (!frame.complete) {
                return;
            }
            buffer = buffer.subarray(frame.size);
            handleFrame(client, frame);
            frame = readFrame(buffer);
        }
    });
    socket.on("close", () => {
        if (clients.delete(client)) {
            console.log(`WebSocket: отключился ${user.username}, всего ${clients.size}`);
        }
    });
    socket.on("error", () => socket.destroy());

    sendMessage(client, {type: "welcome", username: user.username});
}

export function broadcast(message) {
    for (const client of clients) {
        if (client.socket.writableLength > MAX_BUFFERED) {
            closeClient(client, 1013, "Client too slow");
        } else {
            sendMessage(client, message);
        }
    }
}

export function clientCount() {
    return clients.size;
}

export function startHeartbeat() {
    const timer = setInterval(() => {
        const now = Date.now() / 1000;
        for (const client of clients) {
            if (client.user.exp <= now) {
                closeClient(client, 4001, "Token expired");
            } else if (!client.alive) {
                clients.delete(client);
                client.socket.destroy();
            } else {
                client.alive = false;
                sendFrame(client.socket, OPCODE.PING);
            }
        }
    }, PING_INTERVAL);
    timer.unref();
}
