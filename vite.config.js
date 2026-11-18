import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { seoAssets } from "./build/seo.js";
import { securityHeaders } from "./build/securityHeaders.js";

export default defineConfig(({ mode }) => ({
  // No compartir la caché del servidor en ejecución con Vitest u otros Vite de QA.
  cacheDir: "node_modules/.vite-homeestate",
  optimizeDeps: {
    // Estas dependencias solo aparecen al abrir el detalle o su galería lazy.
    include: [
      "react-icons/io5",
      "yet-another-react-lightbox",
      "yet-another-react-lightbox/plugins/counter",
      "yet-another-react-lightbox/plugins/zoom",
    ],
  },
  plugins: [
    react(),
    tailwindcss(),
    seoAssets(loadEnv(mode, process.cwd(), "VITE_").VITE_SITE_URL),
    securityHeaders(),
  ],
}));