import {writable} from "svelte/store";

function readLocation() {
    return {path: location.pathname, query: new URLSearchParams(location.search)};
}

export const route = writable(readLocation());

export function navigate(url, replace = false) {
    if (replace) {
        history.replaceState(null, "", url);
    } else {
        history.pushState(null, "", url);
    }
    route.set(readLocation());
}

export function setQuery(params) {
    history.replaceState(null, "", `${location.pathname}?${params}`);
}

window.addEventListener("popstate", () => route.set(readLocation()));
