import {defineConfig} from "vite";
import {sveltekit} from "@sveltejs/kit/vite";
import adapter from "@sveltejs/adapter-node";

export default defineConfig({
    plugins: [
        sveltekit({
            adapter: adapter(),
            paths: {origin: process.env.ORIGIN},
        }),
    ],
    server: {
        port: 5173,
        proxy: {
            "/realtime": {
                target: process.env.REALTIME_URL ?? "http://localhost:4000",
                rewrite: path => path.replace(/^\/realtime/, ""),
            },
        },
    },
});
