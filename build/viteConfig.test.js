import { expect, test } from "vitest";
import viteConfig from "../vite.config.js";
import unitConfig from "../vitest.config.js";
import navigationConfig from "../vitest.navigation.config.js";

test("desarrollo y ambas suites mantienen cachés independientes", () => {
  const application = viteConfig({ mode: "test" });
  const directories = [application.cacheDir, unitConfig.cacheDir, navigationConfig.cacheDir];
  expect(directories.every((directory) => typeof directory === "string" && directory.startsWith("node_modules/"))).toBe(true);
  expect(new Set(directories).size).toBe(3);
});

test("las dependencias diferidas del detalle y galería se preoptimizan", () => {
  const application = viteConfig({ mode: "test" });
  expect(application.optimizeDeps.include).toEqual(expect.arrayContaining([
    "react-icons/io5",
    "yet-another-react-lightbox",
    "yet-another-react-lightbox/plugins/counter",
    "yet-another-react-lightbox/plugins/zoom",
  ]));
});