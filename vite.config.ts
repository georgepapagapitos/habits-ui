/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          name: "Habits",
          short_name: "Habits",
          description: "Track your habits",
          theme_color: "#ffffff",
          icons: [
            {
              src: "/icon-192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/icon-512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
          start_url: "/",
          display: "standalone",
          background_color: "#ffffff",
        },
      }),
    ],
    build: {
      minify: "terser",
      terserOptions: {
        compress: {
          // Remove console.log in production
          drop_console: mode === "production",
          // Keep console.warn and console.error
          pure_funcs:
            mode === "production"
              ? ["console.log", "console.info", "console.debug"]
              : [],
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@common": path.resolve(__dirname, "./src/common"),
        "@components": path.resolve(__dirname, "./src/common/components"),
        "@hooks": path.resolve(__dirname, "./src/common/hooks"),
        "@styles": path.resolve(__dirname, "./src/common/styles"),
        "@utils": path.resolve(__dirname, "./src/common/utils"),
        "@theme": path.resolve(__dirname, "./src/common/theme"),
        "@features": path.resolve(__dirname, "./src/features"),
        "@auth": path.resolve(__dirname, "./src/features/auth"),
        "@habits": path.resolve(__dirname, "./src/features/habits"),
        "@layout": path.resolve(__dirname, "./src/layout"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@tests": path.resolve(__dirname, "./src/tests"),
      },
    },
    server: {
      host: "0.0.0.0",
      port: 3000,
      // https: false,
      cors: true,
      proxy: {
        "/api": {
          target: "http://localhost:5050",
          changeOrigin: true,
          secure: false,
        },
      },
      hmr: {
        clientPort: 3000,
        host: "192.168.0.20",
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/tests/setup.ts"],
    },
  };
});
