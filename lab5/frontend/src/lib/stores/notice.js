import {writable} from "svelte/store";

const NOTICE_TIME = 4000;

export const notice = writable(null);

let timer;

export function showNotice(text, isError = false) {
    clearTimeout(timer);
    notice.set({text, isError});
    timer = setTimeout(() => notice.set(null), NOTICE_TIME);
}
