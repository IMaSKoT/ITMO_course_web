import {RTCPeerConnection} from "werift";
import {RTC_HOST, RTC_PORT_MIN, RTC_PORT_MAX} from "./config.js";
import {HttpError, parseJson, readBody, sendJson} from "./http.js";

const clients = new Set();
const MAX_CLIENTS = 10;
const MAX_BUFFERED = 1024 * 1024;

function closeClient(client) {
    if (clients.delete(client)) {
        void client.peer.close().catch(console.error);
    }
}

function send(client, message) {
    if (client.user.exp <= Date.now() / 1000 || client.channel?.bufferedAmount > MAX_BUFFERED) {
        closeClient(client);
        return;
    }
    if (client.channel?.readyState === "open") {
        try {
            client.channel.send(JSON.stringify(message));
        } catch {
            closeClient(client);
        }
    }
}

function publicDescription(description) {
    const sdp = description.sdp.split("\r\n").map(line => {
        if (RTC_HOST && line.startsWith("a=candidate:")) {
            const parts = line.split(" ");
            parts[4] = RTC_HOST;
            return parts.join(" ");
        }
        return line;
    }).join("\r\n");
    return {type: description.type, sdp};
}

export async function acceptOffer(req, res, user) {
    const offer = parseJson(await readBody(req, 64 * 1024));
    if (offer?.type !== "offer" || typeof offer.sdp !== "string"
        || !offer.sdp.includes("m=application") || /m=(audio|video)/.test(offer.sdp)) {
        throw new HttpError(422, "Ожидается WebRTC offer для канала данных");
    }
    if (clients.size >= MAX_CLIENTS) {
        throw new HttpError(503, "Слишком много подключений уведомлений, попробуйте позже");
    }
    const peer = new RTCPeerConnection({
        iceServers: [],
        iceUseDefaultStunServer: false,
        iceUseIpv6: false,
        iceUseTcp: true,
        icePortRange: [RTC_PORT_MIN, RTC_PORT_MAX],
        iceInterfaceAddresses: {udp4: "0.0.0.0"},
    });
    const client = {peer, user, channel: null, lastSeen: Date.now()};
    clients.add(client);
    peer.ondatachannel = ({channel}) => {
        if (client.channel || channel.label !== "notifications") {
            channel.close();
            return;
        }
        client.channel = channel;
        channel.onopen = () => {
            client.lastSeen = Date.now();
            send(client, {type: "welcome", username: user.username});
        };
        channel.onmessage = ({data}) => {
            if (data.toString() === "ping") {
                client.lastSeen = Date.now();
                send(client, {type: "pong"});
            }
        };
        channel.onclose = () => closeClient(client);
    };
    peer.onconnectionstatechange = () => {
        if (["failed", "closed"].includes(peer.connectionState)) {
            closeClient(client);
        }
    };
    try {
        await peer.setRemoteDescription(offer);
        await peer.setLocalDescription(await peer.createAnswer());
        sendJson(res, 200, publicDescription(peer.localDescription));
    } catch {
        closeClient(client);
        throw new HttpError(422, "Не удалось установить WebRTC-соединение");
    }
}

export function broadcast(message) {
    for (const client of clients) {
        send(client, message);
    }
}

export function clientCount() {
    return clients.size;
}

export function startHeartbeat() {
    const timer = setInterval(() => {
        for (const client of clients) {
            if (client.user.exp <= Date.now() / 1000 || Date.now() - client.lastSeen > 45000) {
                closeClient(client);
            }
        }
    }, 1000);
    timer.unref();
}
