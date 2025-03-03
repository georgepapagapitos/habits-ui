import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["src/tests/setup.ts"],
    css: false,
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
