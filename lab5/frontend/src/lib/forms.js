import {invalidate} from "$app/navigation";
import {hasErrors} from "./domain/form.js";
import {showNotice} from "./stores/notice.js";

const REFRESH_INTERVAL = 30000;

export function submitForm(status, {confirmText, notice, validate} = {}) {
    return ({formData, cancel}) => {
        status.errors = validate ? validate(formData) : {};
        if (hasErrors(status.errors)) {
            cancel();
            return;
        }
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

export function visibleErrors(status, form) {
    return hasErrors(status.errors) ? status.errors : form?.errors ?? {};
}

export function startPolling(key) {
    const id = setInterval(() => invalidate(key), REFRESH_INTERVAL);
    return () => clearInterval(id);
}
