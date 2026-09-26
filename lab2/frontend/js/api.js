const BASE_URL = "/api/requests";
const QUERY_THRESHOLD = 3;

async function request(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error.message);
    }

    if (response.status === 204) {
        return null;
    }

    return await response.json();
}

function cleanFilters(filters) {
    const clean = {};

    for (const [key, value] of Object.entries(filters)) {
        if (value === "" || value === null || value === undefined) {
            continue;
        }
        clean[key] = value;
    }

    return clean;
}

export async function getStudents(filters = {}) {
    const clean = cleanFilters(filters);

    if (Object.keys(clean).length > QUERY_THRESHOLD) {
        return request(BASE_URL, {
            method: "QUERY",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(clean),
        });
    }

    const query = new URLSearchParams(clean).toString();
    const url = query ? `${BASE_URL}?${query}` : BASE_URL;

    return request(url);
}

export async function getStudent(isuId) {
    return request(`${BASE_URL}/${isuId}`);
}

export async function createStudent(student) {
    return request(BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(student),
    });
}

export async function updateStudent(isuId, student) {
    return request(`${BASE_URL}/${isuId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(student),
    });
}

export async function deleteStudent(isuId) {
    return request(`${BASE_URL}/${isuId}`, {
        method: "DELETE"
    });
}