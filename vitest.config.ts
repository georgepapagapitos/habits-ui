import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
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
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["src/tests/setup.ts"],
    css: false,
    testTimeout: 20000,
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "**/*.d.ts",
        "src/vite-env.d.ts",
        "src/main.tsx",
        "src/tests/**",
        "**/*.test.{ts,tsx}",
        "**/*.config.{ts,js}",
      ],
    },
  },
});
