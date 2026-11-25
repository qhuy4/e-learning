import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { readFileSync } from "node:fs";

import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

const appVersion = (
    JSON.parse(
        readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
    ) as { version: string }
).version;

// https://vite.dev/config/
export default defineConfig({
    envDir: "../../",
    define: {
        "import.meta.env.VITE_APP_VERSION": JSON.stringify(appVersion),
    },
    server: {
        port: 5173,
        strictPort: true,
        proxy: {
            // Ảnh upload (avatar, thumbnail) BE trả về dạng /storage/img/...
            // → chuyển tiếp về BE khi dev.
            "/storage": {
                target: "http://localhost:3001",
                changeOrigin: true,
            },
        },
    },
    plugins: [
        react(),
        tailwindcss(),
        babel({ presets: [reactCompilerPreset()] }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
