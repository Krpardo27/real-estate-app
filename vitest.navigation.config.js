import { defineConfig } from "vitest/config";

export default defineConfig({
  cacheDir: "node_modules/.vitest-navigation-homeestate",
  test: {
    environment: "node",
    include: ["tests/navigation-loader.test.js"],
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 30000,
  },
});