import LoginPage from "../pages/LoginPage.svelte";
import NotFoundPage from "../pages/NotFoundPage.svelte";
import ProfilePage from "../pages/ProfilePage.svelte";
import RegisterPage from "../pages/RegisterPage.svelte";

const routes = [
    {pattern: /^\/login$/, component: LoginPage, access: "guest"},
    {pattern: /^\/register$/, component: RegisterPage, access: "guest"},
    {pattern: /^\/profile$/, component: ProfilePage, access: "user"},
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
