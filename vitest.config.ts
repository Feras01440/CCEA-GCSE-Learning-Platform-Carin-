import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // The packs surveys read every shipped bundle; 5 s timed out under a build and under ten agents (9 and 11 Oct 2026).
    testTimeout: 30_000,
  },
});
