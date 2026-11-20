import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import sharp from "sharp";

test("producción: cabeceras, noindex y navegación accesible", async ({ page }) => {
  const response = await page.goto("/");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-robots-tag"]).toBe("noindex, follow");
  expect(response.headers()["content-security-policy"]).not.toMatch(/unsafe-eval|script-src[^;]*unsafe-inline/);
  await expect(page.getByRole("heading", { name: "Explora propiedades en Chile", exact: true })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
  expect(await page.locator('link[rel="preload"][as="image"]').count()).toBe(0);
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations).toEqual([]);
  await page.locator("footer").getByRole("link", { name: "Todas las propiedades", exact: true }).click();
  await expect(page).toHaveURL(/\/search\?filters=all$/);
  await expect(page.getByText("600 propiedades encontradas", { exact: true })).toBeVisible();
});

test("producción móvil: filtros compatibles, galería y guardados", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/search");
  await page.getByRole("button", { name: "Filtros", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Tipo de propiedad", { exact: true }).selectOption("land");
  await expect(dialog.getByLabel("Dormitorios mínimos", { exact: true })).toBeDisabled();
  await expect(dialog.getByLabel("Baños mínimos", { exact: true })).toBeDisabled();
  await dialog.getByRole("button", { name: "Limpiar filtros", exact: true }).click();
  await dialog.getByRole("button", { name: "Ver resultados", exact: true }).click();
  await page.locator("main article h3 a").first().click();
  const trigger = page.getByRole("button", { name: /^Ampliar fotografía 1 de/ });
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Galería de la propiedad", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await page.getByRole("button", { name: /^Guardar:/ }).first().click();
  await expect(page.getByRole("navigation", { name: "Navegación móvil", exact: true }).getByRole("link", { name: "Guardados, 1 propiedad", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("producción: mapa con worker CSP local y popup paginado", async ({ page }) => {
  // Se comprueba el motor/worker, no disponibilidad o calidad de cartografía externa.
  await page.route("https://tiles.openfreemap.org/**", (route) => route.fulfill({
    contentType: "application/json", body: JSON.stringify({ version: 8, sources: {
      fixture: { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[-74, -38], [-69, -38], [-69, -28], [-74, -28], [-74, -38]]] } } },
    }, layers: [
      { id: "background", type: "background", paint: { "background-color": "#e2e8f0" } },
      { id: "fixture-fill", type: "fill", source: "fixture", paint: { "fill-color": "#c62026" } },
    ] }),
  }));
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/map?filters=all");
  const map = page.getByTestId("properties-map");
  await expect(map).toHaveAttribute("data-loaded", "true");
  // La geometría debe procesarse en el worker y dibujarse realmente, no basta
  // un canvas vacío o un onLoad exitoso tras cambiar la compilación del motor.
  await expect.poll(async () => {
    const image = await map.locator("canvas.maplibregl-canvas").screenshot();
    const { data, info } = await sharp(image).raw().toBuffer({ resolveWithObject: true });
    let redPixels = 0;
    for (let i = 0; i < data.length; i += info.channels) {
      if (data[i] > 150 && data[i + 1] < 90 && data[i + 2] < 110) redPixels++;
    }
    return redPixels;
  }).toBeGreaterThan(1000);
  await map.locator(".property-map__marker--cluster").first().click();
  const popup = page.getByRole("dialog");
  await expect(popup).toBeVisible();
  expect(await popup.locator("li").count()).toBeLessThanOrEqual(6);
  const next = popup.getByRole("button", { name: "Siguiente", exact: true });
  if (await next.count()) {
    await next.click();
    await expect(popup.getByRole("list", { name: "Fichas en esta ubicación aproximada", exact: true })).toBeFocused();
    await expect(popup.getByRole("status")).toContainText("7–");
  }
  await page.keyboard.press("Escape");
  await expect(popup).toBeHidden();
  expect(errors).toEqual([]);
});

test("producción: mapa y galería no se descargan desde la portada; Motion tiene carga propia", async ({ page }) => {
  const scripts = [];
  page.on("request", (request) => {
    if (request.resourceType() === "script") scripts.push(request.url());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Explora propiedades en Chile", exact: true })).toBeVisible();
  await expect.poll(() => scripts.some((url) => /\/motionFeatures-[^/]+\.js/.test(url))).toBe(true);
  expect(scripts.filter((url) => /\/(?:map-|mapLibrary-|mapWorker-|PropertiesMap-|PropertyLightbox-)/.test(url))).toEqual([]);
  expect(await page.locator('link[rel="modulepreload"][href*="map-"]').count()).toBe(0);
});