import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Las pruebas no dependen de plugins de despliegue, SEO ni cabeceras del servidor.
export default defineConfig({
  cacheDir: "node_modules/.vitest-homeestate",
  plugins: [react()],
  test: {
    environment: "node",
    globals: false,
    include: ["src/**/*.test.{js,jsx}", "build/**/*.test.js"],
    clearMocks: true,
  },
});