import LoginPage from "../pages/LoginPage.svelte";
import NotFoundPage from "../pages/NotFoundPage.svelte";
import ProfilePage from "../pages/ProfilePage.svelte";
import RegisterPage from "../pages/RegisterPage.svelte";
import StudentFormPage from "../pages/StudentFormPage.svelte";
import StudentPage from "../pages/StudentPage.svelte";
import StudentsPage from "../pages/StudentsPage.svelte";

const routes = [
    {pattern: /^\/login$/, component: LoginPage, access: "guest"},
    {pattern: /^\/register$/, component: RegisterPage, access: "guest"},
    {pattern: /^\/profile$/, component: ProfilePage, access: "user"},
    {pattern: /^\/(students)?$/, component: StudentsPage, access: "user"},
    {pattern: /^\/students\/new$/, component: StudentFormPage, access: "admin"},
    {pattern: /^\/students\/(?<isuId>\d+)$/, component: StudentPage, access: "user"},
    {pattern: /^\/students\/(?<isuId>\d+)\/edit$/, component: StudentFormPage, access: "admin"},
];

export function findRoute(path) {
    for (const route of routes) {
        const match = path.match(route.pattern);
        if (match) {
            return {...route, params: match.groups ?? {}};
        }
    }
    return {component: NotFoundPage, params: {}};
}
