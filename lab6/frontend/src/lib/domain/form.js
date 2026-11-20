export function readForm(formData, names) {
    const values = {};
    for (const name of names) {
        values[name] = String(formData.get(name) ?? "");
    }
    return values;
}

export function hasErrors(errors) {
    return Object.keys(errors).length > 0;
}
