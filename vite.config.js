import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { seoAssets } from "./build/seo.js";
import { securityHeaders } from "./build/securityHeaders.js";
import { mapAliases, createChunkClassifier, mapSourceLicense } from "./build/chunks.js";
import { zodComments } from "./build/zodComments.js";
import { chunkBudget } from "./build/chunkBudget.js";

export default defineConfig(({ mode }) => ({
  // No compartir la caché del servidor en ejecución con Vitest u otros Vite de QA.
  cacheDir: "node_modules/.vite-homeestate",
  resolve: { alias: mapAliases },
  optimizeDeps: {
    exclude: ["maplibre-gl", "maplibre-worker-source"],
    // Estas dependencias solo aparecen al abrir el detalle o su galería lazy.
    include: [
      "bidi-js",
      "murmurhash-js",
      "react-icons/io5",
      "yet-another-react-lightbox",
      "yet-another-react-lightbox/plugins/counter",
      "yet-another-react-lightbox/plugins/zoom",
    ],
  },
  build: {
    manifest: true,
    rollupOptions: {
      output: { onlyExplicitManualChunks: true, manualChunks: createChunkClassifier() },
    },
  },
  worker: {
    format: "es",
    plugins: () => [chunkBudget()],
    rollupOptions: {
      output: { onlyExplicitManualChunks: true, manualChunks: createChunkClassifier({ worker: true }) },
    },
  },
  plugins: [
    zodComments(),
    chunkBudget(),
    mapSourceLicense(),
    react(),
    tailwindcss(),
    seoAssets(loadEnv(mode, process.cwd(), "VITE_").VITE_SITE_URL),
    securityHeaders(),
  ],
}));