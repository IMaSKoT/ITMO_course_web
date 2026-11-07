import {request} from "./http.js";

export function getStudents(params, signal) {
    return request("/students", {method: "QUERY", body: params, signal});
}

export function getStudent(isuId, signal) {
    return request(`/students/${isuId}`, {signal});
}

export function createStudent(student, signal) {
    return request("/students", {method: "POST", body: student, signal});
}

export function replaceStudent(isuId, student, signal) {
    return request(`/students/${isuId}`, {method: "PUT", body: student, signal});
}

export function deleteStudent(isuId, signal) {
    return request(`/students/${isuId}`, {method: "DELETE", signal});
}
