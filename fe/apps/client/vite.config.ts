import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

import tailwindcss from '@tailwindcss/vite'
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  envDir: '../../',
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
    babel({ presets: [reactCompilerPreset()] })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
