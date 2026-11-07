import {invalidate} from "$app/navigation";
import {showNotice} from "./stores/notice.js";

const REFRESH_INTERVAL = 30000;

export function submitForm(status, {confirmText, notice} = {}) {
    return ({cancel}) => {
        if (confirmText && !confirm(confirmText)) {
            cancel();
            return;
        }
        status.loading = true;
        return async ({result, update}) => {
            if (notice && (result.type === "success" || result.type === "redirect")) {
                showNotice(notice);
            }
            await update({navigate: false});
            status.loading = false;
        };
    };
}

export function startPolling(key) {
    const id = setInterval(() => invalidate(key), REFRESH_INTERVAL);
    return () => clearInterval(id);
}
