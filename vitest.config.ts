import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      thresholds: {
        statements: 72,
        branches: 84,
        functions: 76,
        lines: 71,
      },
    },
  },
});
