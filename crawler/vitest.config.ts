/// <reference types="vitest" />
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

// import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [
    // react(),
    tsconfigPaths(),
  ],
  test: {
    globals: true,
    mockReset: true,
    restoreMocks: true,
    // environment: "happy-dom",
    // setupFiles: ["./test/setup-test-env.ts"],
    // include: ["./app/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    watchExclude: [
      "python\\/.*",
      ".*\\/node_modules\\/.*",
      ".*\\/build\\/.*",
      ".*\\/postgres-data\\/.*",
    ],
  },
})
