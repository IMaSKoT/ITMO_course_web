import {requireAdmin} from "#lib/server/session.js";

export function load({locals}) {
    requireAdmin(locals);
}
