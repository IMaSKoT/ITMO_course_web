import {invalidate} from "$app/navigation";
import {showNotice} from "./stores/notice.js";

export const ACTION_LABELS = {CREATE: "Добавлен", UPDATE: "Изменён", DELETE: "Удалён"};

export async function refreshSession() {
    const response = await fetch("/session", {method: "POST"});
    if (!response.ok) {
        throw new Error("Сессия истекла, войдите в систему заново");
    }
}

export async function realtimeRequest(path, options) {
    await refreshSession();
    const response = await fetch("/realtime" + path, options);
    const data = await response.json();
    if (!response.ok) {
        const error = new Error(data.error?.message ?? "Сервис реального времени недоступен");
        error.status = response.status;
        throw error;
    }
    return data;
}

export function connectRealtime(onstatus) {
    let peer;
    let channel;
    let stopped = false;
    let retryTimer;
    let updateTimer;
    let heartbeat;
    let connectionTimer;
    let lastMessage = Date.now();
    let retryDelay = 1000;

    function close() {
        clearInterval(heartbeat);
        clearTimeout(connectionTimer);
        if (channel) {
            channel.onclose = null;
            channel.onerror = null;
            channel.close();
            channel = null;
        }
        if (peer) {
            peer.onconnectionstatechange = null;
            peer.close();
            peer = null;
        }
    }

    function refreshPages() {
        clearTimeout(updateTimer);
        updateTimer = setTimeout(async () => {
            try {
                await refreshSession();
                await invalidate("app:students");
                await invalidate("app:journal");
            } catch {
                onstatus("Не удалось обновить данные");
            }
        }, 200);
    }

    function retry() {
        if (stopped || retryTimer) {
            return;
        }
        close();
        onstatus("Связь потеряна, переподключение…");
        retryTimer = setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 15000);
    }

    async function connect() {
        retryTimer = null;
        try {
            await refreshSession();
            if (stopped) {
                return;
            }
            const connection = new RTCPeerConnection({iceServers: []});
            peer = connection;
            channel = peer.createDataChannel("notifications", {ordered: true});
            connectionTimer = setTimeout(retry, 20000);
            channel.onopen = () => {
                clearTimeout(connectionTimer);
                retryDelay = 1000;
                lastMessage = Date.now();
                onstatus("");
                refreshPages();
                heartbeat = setInterval(() => {
                    if (Date.now() - lastMessage > 45000) {
                        retry();
                    } else if (channel?.readyState === "open") {
                        channel.send("ping");
                    }
                }, 15000);
            };
            channel.onmessage = event => {
                lastMessage = Date.now();
                const message = JSON.parse(event.data);
                if (message.type === "journal-entry") {
                    const entry = message.entry;
                    showNotice(`${ACTION_LABELS[entry.action]} студент ${entry.fullName} (${entry.isuId}). Пользователь: ${entry.username}`);
                    refreshPages();
                }
            };
            channel.onclose = retry;
            channel.onerror = retry;
            peer.onconnectionstatechange = () => {
                if (connection.connectionState === "failed") {
                    retry();
                }
            };
            await peer.setLocalDescription(await peer.createOffer());
            await waitForIce(connection);
            if (stopped || peer !== connection) {
                return;
            }
            const answer = await realtimeRequest("/rtc/offer", {
                method: "POST", headers: {"Content-Type": "application/json"},
                body: JSON.stringify(peer.localDescription),
            });
            if (!stopped && peer === connection) {
                await peer.setRemoteDescription(answer);
            }
        } catch {
            retry();
        }
    }

    onstatus("Подключение уведомлений…");
    void connect();
    return () => {
        stopped = true;
        clearTimeout(retryTimer);
        clearTimeout(updateTimer);
        close();
    };
}

function waitForIce(peer) {
    if (peer.iceGatheringState === "complete") {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            peer.onicegatheringstatechange = null;
            reject(new Error("Не удалось собрать ICE-кандидаты"));
        }, 10000);
        peer.onicegatheringstatechange = () => {
            if (peer.iceGatheringState === "complete") {
                clearTimeout(timer);
                peer.onicegatheringstatechange = null;
                resolve();
            }
        };
    });
}
