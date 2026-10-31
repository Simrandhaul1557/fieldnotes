import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./frontend/app"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  test: {
    exclude: [
      "**/node_modules/**",
      "**/.git/**",
      "**/dist/**",
      "**/.react-router/**",
      // Root framework paths are junctions into frontend/ and backend/.
      // Test the real files there so specs are not discovered twice.
      "app/**",
      "actions/**",
      "server/**",
      "drizzle/**",
    ],
  },
});
