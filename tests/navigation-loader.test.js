import { afterAll, afterEach, beforeAll, beforeEach, expect, test } from "vitest";
import { fileURLToPath } from "node:url";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createServer } from "vite";
import { FAVORITES_STORAGE_KEY } from "../src/stores/favoritesStore.js";
import { properties } from "../src/data/properties.js";
import { DEFAULT_PROPERTY_FILTERS } from "../src/utils/propertyFilters.js";

let server;
let browser;
let context;
let page;
let baseURL;
let gates = [];

beforeAll(async () => {
  // Usa la configuración real, incluidos SEO y cabeceras; no evita errores del build.
  server = await createServer({
    root: fileURLToPath(new URL("../", import.meta.url)),
    cacheDir: "node_modules/.vite-navigation-tests",
    server: { host: "127.0.0.1", port: 0 },
  });
  await server.listen();
  baseURL = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
});

afterAll(async () => {
  await browser?.close();
  await server?.close();
});

beforeEach(async () => {
  gates = [];
  context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  page = await context.newPage();
});

afterEach(async () => {
  gates.forEach((release) => release());
  await context?.close();
});

const holdPage = async (name) => {
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  gates.push(release);
  const pattern = new RegExp(`/src/pages/${name}\\.jsx(?:\\?.*)?$`);
  const requested = page.waitForRequest(pattern);
  await page.route(pattern, async (route) => {
    await gate;
    await route.continue();
  });
  return { requested, release };
};

const loaderActive = () => page.locator(".navigation-loading").count();

test.each(["reduce", "no-preference"])("hero: animaciones respetan %s y no bloquean el buscador", async (reducedMotion) => {
  await page.emulateMedia({ reducedMotion });
  await page.goto(baseURL);
  for (const name of ["Explora propiedades en Chile", "¿Qué propiedad buscas?"]) {
    const heading = page.getByRole("heading", { name, exact: true });
    await heading.waitFor();
    await expect.poll(() => heading.evaluate((element) => ({
      opacity: getComputedStyle(element).opacity,
      transform: getComputedStyle(element).transform,
    }))).toEqual({ opacity: "1", transform: "none" });
  }
  const search = page.getByRole("search", { name: "Buscar propiedades" });
  expect(await search.getByRole("button", { name: "Buscar", exact: true }).isEnabled()).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test.each(["reduce", "no-preference"])("secciones: entradas únicas con preferencia %s", async (reducedMotion) => {
  await page.emulateMedia({ reducedMotion });
  await page.goto(baseURL);
  const entries = [
    page.locator('section[aria-labelledby="home-categories-title"] a').first(),
    page.locator("#propiedades article > div > a > div").first(),
    page.locator('#ciudades a[href^="/search?city="]').first(),
  ];
  for (const entry of entries) {
    await entry.scrollIntoViewIfNeeded();
    await expect.poll(() => entry.evaluate((element) => getComputedStyle(element).transform)).toBe("none");
    expect(await entry.evaluate((element) => getComputedStyle(element).opacity)).toBe("1");
    await page.evaluate(() => scrollTo(0, 0));
    await entry.scrollIntoViewIfNeeded();
    expect(await entry.evaluate((element) => getComputedStyle(element).transform)).toBe("none");
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("portada editorial responsive sin desbordamiento y con estructura accesible", async () => {
  await page.goto(baseURL);
  await page.getByRole("heading", { name: "Explora propiedades en Chile", exact: true }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  for (const width of [320, 375, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator("main h1").count()).toBe(1);
    const searchBox = await page.getByRole("search", { name: "Buscar propiedades" }).boundingBox();
    expect(searchBox.x).toBeGreaterThanOrEqual(0);
    expect(searchBox.x + searchBox.width).toBeLessThanOrEqual(width);
    expect(await page.locator("#propiedades article").count()).toBe(3);
    expect(await page.locator('#ciudades a[href^="/search?city="]').count()).toBe(5);
  }
  expect(await page.getByRole("link", { name: "Ver todas las propiedades", exact: true }).getAttribute("href")).toBe("/search?filters=all");
  expect(await page.getByRole("link", { name: "Explorar el mapa", exact: true }).getAttribute("href")).toBe("/map?filters=all");
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations).toEqual([]);
  }
});

test("el buscador de portada conserva dependencias, orden de teclado y envío de filtros", async () => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(baseURL);
  const search = page.getByRole("search", { name: "Buscar propiedades" });
  const district = search.getByLabel("Comuna", { exact: true });
  expect(await district.isDisabled()).toBe(true);
  await search.getByLabel("Región", { exact: true }).selectOption("13");
  await district.selectOption("Ñuñoa");
  await search.getByLabel("Región", { exact: true }).selectOption("5");
  await expect.poll(() => district.inputValue()).toBe("");
  await search.getByLabel("Región", { exact: true }).selectOption("13");
  await district.selectOption("Ñuñoa");
  await search.getByLabel("Tipo de propiedad", { exact: true }).selectOption("apartment");
  await search.getByLabel("Precio máximo (CLP)", { exact: true }).selectOption("350000000");
  await search.getByLabel("Precio máximo (CLP)", { exact: true }).focus();
  await page.keyboard.press("Tab");
  expect(await search.getByRole("button", { name: "Buscar", exact: true }).evaluate((element) => element === document.activeElement)).toBe(true);
  const submitBox = await search.getByRole("button", { name: "Buscar", exact: true }).boundingBox();
  const dockBox = await page.getByRole("navigation", { name: "Navegación móvil", exact: true }).boundingBox();
  expect(submitBox.y + submitBox.height).toBeLessThanOrEqual(dockBox.y);
  await page.keyboard.press("Tab");
  expect(await search.getByRole("button", { name: "Ver todo el catálogo", exact: true }).evaluate((element) => element === document.activeElement)).toBe(true);
  await search.getByRole("button", { name: "Buscar", exact: true }).click();
  await page.waitForURL((url) => url.pathname === "/search" && url.searchParams.get("district") === "Ñuñoa");
  const query = new URL(page.url()).searchParams;
  expect(Object.fromEntries(query)).toEqual({ region: "13", district: "Ñuñoa", type: "apartment", price: "350000000" });
});

test("la búsqueda inicial muestra todos los filtros activos y permite limpiar y restablecer", async () => {
  await page.goto(`${baseURL}/search`);
  await page.locator("main article").first().waitFor();
  const sidebar = page.locator("aside").first();
  const assertPreset = async () => {
    for (const [key, value] of Object.entries(DEFAULT_PROPERTY_FILTERS)) {
      await expect.poll(() => sidebar.locator(`select[name="${key}"]`).inputValue()).toBe(value);
      expect(new URL(page.url()).searchParams.get(key)).toBe(value);
    }
    expect(await sidebar.getByLabel("8 filtros activos", { exact: true }).count()).toBe(1);
    expect(await page.locator("main article").count()).toBeGreaterThan(0);
  };
  await assertPreset();
  await sidebar.getByRole("button", { name: "Limpiar filtros", exact: true }).click();
  await page.waitForURL("**/search?filters=all");
  for (const key of Object.keys(DEFAULT_PROPERTY_FILTERS)) {
    await expect.poll(() => sidebar.locator(`select[name="${key}"]`).inputValue()).toBe("");
  }
  await sidebar.getByRole("button", { name: "Restablecer selección inicial", exact: true }).click();
  await page.waitForURL((url) => url.searchParams.get("district") === "Peñalolén");
  await assertPreset();
});

test("ajustar tipo retira dependencias incompatibles sin reiniciar el scroll", async () => {
  await page.goto(`${baseURL}/search`);
  const sidebar = page.locator("aside").first();
  await sidebar.getByLabel("Tipo de propiedad", { exact: true }).waitFor();
  await page.evaluate(() => scrollTo(0, 160));
  await sidebar.getByLabel("Tipo de propiedad", { exact: true }).selectOption("land");
  await expect.poll(() => new URL(page.url()).searchParams.get("type")).toBe("land");
  expect(new URL(page.url()).searchParams.has("bedrooms")).toBe(false);
  expect(new URL(page.url()).searchParams.has("bathrooms")).toBe(false);
  await expect.poll(() => sidebar.getByLabel("Dormitorios mínimos", { exact: true }).isDisabled()).toBe(true);
  await expect.poll(() => sidebar.getByLabel("Baños mínimos", { exact: true }).isDisabled()).toBe(true);
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
});

test("retirar chips y paginar conserva un destino útil para el foco", async () => {
  await page.goto(`${baseURL}/search?city=Talca`);
  const remove = page.getByRole("button", { name: "Quitar filtro Ciudad: Talca", exact: true });
  await remove.focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => page.locator("#search-results-title").evaluate((element) => document.activeElement === element)).toBe(true);
  const next = page.getByRole("link", { name: "Siguiente", exact: true });
  await next.focus();
  await page.keyboard.press("Enter");
  await page.waitForURL("**page=2**");
  await expect.poll(() => page.locator("#search-results-title").evaluate((element) => document.activeElement === element)).toBe(true);
});

test("quitar el último favorito con teclado no pierde el foco en el documento", async () => {
  await page.addInitScript(({ key }) => localStorage.setItem(key, "[1]"), { key: FAVORITES_STORAGE_KEY });
  await page.goto(`${baseURL}/favorites`);
  const remove = page.locator("main article").getByRole("button");
  await remove.focus();
  await page.keyboard.press("Space");
  await expect.poll(() => page.getByRole("heading", { name: "Propiedades guardadas", exact: true }).evaluate((element) => document.activeElement === element)).toBe(true);
});

test.each(["menú", "enlace interno", "buscador", "botón navigate"])("navegación mediante %s muestra el skeleton de destino sin desmontar el contenido anterior", async (source) => {
  const held = await holdPage(source === "menú" ? "Favorites" : "SearchResults");
  await page.goto(baseURL);
  const hero = page.getByRole("search", { name: "Buscar propiedades" });
  const heroElement = await hero.elementHandle();
  if (source === "menú") await page.getByRole("navigation", { name: "Navegación principal", exact: true }).getByRole("link", { name: "Guardados", exact: true }).click();
  if (source === "enlace interno") await page.getByRole("link", { name: "Ver todas las propiedades", exact: true }).click();
  if (source === "buscador") {
    await hero.getByLabel("Tipo de propiedad", { exact: true }).selectOption("house");
    await hero.getByRole("button", { name: "Buscar", exact: true }).click();
  }
  if (source === "botón navigate") await hero.getByRole("button", { name: "Ver todo el catálogo", exact: true }).click();
  await held.requested;
  await expect.poll(loaderActive).toBe(1);
  await page.waitForFunction(() => getComputedStyle(document.querySelector(".navigation-loading")).opacity === "1");
  expect(await hero.isVisible()).toBe(false);
  expect(await page.locator("footer").isVisible()).toBe(false);
  expect(await heroElement.evaluate((element) => element.isConnected)).toBe(true);
  expect(await page.getByRole("status", { name: "Cargando página", exact: true }).count()).toBe(1);
  expect(await page.getByRole("heading", { name: source === "menú" ? "Cargando tus guardados" : "Buscando propiedades", exact: true }).isVisible()).toBe(true);
  const style = await page.locator(".navigation-loading").evaluate((element) => {
    const value = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return { position: value.position, pointerEvents: value.pointerEvents, zIndex: Number(value.zIndex), top: box.top, width: box.width, viewport: innerWidth };
  });
  expect(style).toMatchObject({ position: "fixed", top: 80 });
  expect(style.width).toBe(style.viewport);
  expect(style.zIndex).toBeLessThan(50);
  expect(await page.getByRole("navigation", { name: "Navegación principal", exact: true }).isVisible()).toBe(true);
  expect(await page.locator(".navigation-loader").count()).toBe(0);
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations).toEqual([]);
  held.release();
  await page.waitForURL(source === "menú" ? "**/favorites" : "**/search?**");
  await expect.poll(loaderActive).toBe(0);
  expect(await page.locator("main h1").isVisible()).toBe(true);
});

test("navegaciones consecutivas actualizan el skeleton hasta que termina el último destino", async () => {
  const favorites = await holdPage("Favorites");
  const search = await holdPage("SearchResults");
  await page.goto(baseURL);
  const navigation = page.getByRole("navigation", { name: "Navegación principal", exact: true });
  await navigation.getByRole("link", { name: "Guardados", exact: true }).click();
  await favorites.requested;
  await navigation.getByRole("link", { name: "Buscar", exact: true }).click();
  await search.requested;
  favorites.release();
  expect(await loaderActive()).toBe(1);
  await page.getByRole("heading", { name: "Buscando propiedades", exact: true }).waitFor();
  search.release();
  await page.waitForURL("**/search?**");
  await expect.poll(loaderActive).toBe(0);
  expect(await page.locator("main h1").textContent()).toBe("Encuentra tu propiedad");
});

test("misma ruta, filtros y favoritos no provocan destellos ni desmontan el contenido", async () => {
  await page.goto(`${baseURL}/search?filters=all`);
  await page.locator("main article").first().waitFor();
  const outlet = await page.locator(".route-outlet > div").elementHandle();
  await page.evaluate(() => {
    window.observedPageLoads = 0;
    window.watchPageLoads = true;
    const sample = () => {
      const element = document.querySelector(".navigation-loading");
      if (element && Number(getComputedStyle(element).opacity) > 0) window.observedPageLoads += 1;
      if (window.watchPageLoads) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await page.getByRole("navigation", { name: "Navegación principal", exact: true }).getByRole("link", { name: "Buscar", exact: true }).click();
  await page.locator("aside").first().getByLabel("Precio máximo (CLP)", { exact: true }).selectOption("350000000");
  await page.waitForURL("**/search?**price=350000000**");
  await page.getByRole("button", { name: /^Guardar:/ }).first().click();
  expect(await loaderActive()).toBe(0);
  expect(await outlet.evaluate((element) => element.isConnected)).toBe(true);
  expect(await page.evaluate(() => { window.watchPageLoads = false; return window.observedPageLoads; })).toBe(0);
});

test("las navegaciones rápidas no tienen destello ni retraso artificial", async () => {
  await page.goto(`${baseURL}/favorites`);
  await page.getByRole("heading", { name: "Propiedades guardadas", exact: true }).waitFor();
  await page.getByRole("link", { name: "HomeEstate, propiedades en Chile, inicio", exact: true }).click();
  await page.getByRole("heading", { name: "Explora propiedades en Chile", exact: true }).waitFor();
  await page.evaluate(() => {
    window.flashOpacity = 0;
    window.watchFlash = true;
    const sample = () => {
      const loader = document.querySelector(".navigation-loading");
      if (loader) window.flashOpacity = Math.max(window.flashOpacity, Number(getComputedStyle(loader).opacity));
      if (window.watchFlash) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await page.getByRole("navigation", { name: "Navegación principal", exact: true }).getByRole("link", { name: "Guardados", exact: true }).click();
  await page.waitForURL("**/favorites");
  expect(await loaderActive()).toBe(0);
  expect(await page.evaluate(() => { window.watchFlash = false; return window.flashOpacity; })).toBe(0);
});

test("movimiento reducido y dock móvil siguen disponibles durante la navegación", async () => {
  const held = await holdPage("MapView");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(baseURL);
  const dock = page.getByRole("navigation", { name: "Navegación móvil", exact: true });
  await dock.getByRole("link", { name: "Mapa", exact: true }).click();
  await held.requested;
  await expect.poll(loaderActive).toBe(1);
  expect(await dock.isVisible()).toBe(true);
  await page.getByRole("heading", { name: "Preparando el mapa", exact: true }).waitFor();
  expect(await page.locator(".route-loading-progress > span").evaluate((element) => getComputedStyle(element).animationIterationCount)).toBe("1");
  await dock.getByRole("link", { name: "Inicio", exact: true }).click();
  await expect.poll(loaderActive).toBe(0);
  held.release();
});

test("un error de carga gestionado elimina el skeleton", async () => {
  await page.route(/\/src\/pages\/Favorites\.jsx(?:\?.*)?$/, (route) => route.abort());
  await page.goto(baseURL);
  await page.getByRole("navigation", { name: "Navegación principal", exact: true }).getByRole("link", { name: "Guardados", exact: true }).click();
  await page.getByRole("heading", { name: "No se pudo cargar la página", exact: true }).waitFor();
  expect(await loaderActive()).toBe(0);
  expect(await page.getByText("Cargando página…", { exact: true }).count()).toBe(0);
  expect(await page.locator("main .route-outlet").getByRole("heading", { name: "No se pudo cargar la página", exact: true }).count()).toBe(1);
  expect(await page.getByRole("navigation", { name: "Navegación principal", exact: true }).isVisible()).toBe(true);
  expect(await page.locator("footer").count()).toBe(1);
  await page.getByRole("link", { name: "Volver al inicio", exact: true }).click();
  await page.getByRole("heading", { name: "Explora propiedades en Chile", exact: true }).waitFor();
  expect(await page.getByRole("heading", { name: "No se pudo cargar la página", exact: true }).count()).toBe(0);
});

test("un fallo de render queda dentro del Outlet y permite seguir navegando en móvil", async () => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route(/\/src\/pages\/Favorites\.jsx(?:\?.*)?$/, (route) => route.fulfill({
    contentType: "application/javascript",
    body: 'export default function Favorites() { throw new Error("Fallo de render simulado"); }',
  }));
  await page.goto(baseURL);
  const header = await page.locator("header").first().elementHandle();
  const dock = page.getByRole("navigation", { name: "Navegación móvil", exact: true });
  await dock.getByRole("link", { name: "Guardados", exact: true }).click();
  await page.locator("main .route-outlet").getByRole("heading", { name: "No se pudo cargar la página", exact: true }).waitFor();
  expect(await header.evaluate((element) => element.isConnected)).toBe(true);
  expect(await dock.isVisible()).toBe(true);
  expect(await page.locator("main#main-content").count()).toBe(1);
  expect(await loaderActive()).toBe(0);
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations).toEqual([]);
  await dock.getByRole("link", { name: "Inicio", exact: true }).click();
  await page.getByRole("heading", { name: "Explora propiedades en Chile", exact: true }).waitFor();
  expect(await header.evaluate((element) => element.isConnected)).toBe(true);
});

test("la carga inicial de una ruta lazy conserva su fallback sin duplicarlo", async () => {
  const held = await holdPage("Favorites");
  await page.goto(`${baseURL}/favorites`, { waitUntil: "domcontentloaded" });
  await held.requested;
  await page.getByRole("status", { name: "Cargando página", exact: true }).waitFor();
  expect(await loaderActive()).toBe(0);
  expect(await page.getByRole("status", { name: "Cargando página", exact: true }).count()).toBe(1);
  held.release();
  await page.getByRole("heading", { name: "Propiedades guardadas", exact: true }).waitFor();
});

test("el skeleton de propiedad es visible desde el pie sin modificar el scroll del documento", async () => {
  const held = await holdPage("PropertyDetail");
  await page.goto(baseURL);
  await page.locator("main article h3 a").first().scrollIntoViewIfNeeded();
  const scroll = await page.evaluate(() => scrollY);
  await page.locator("main article h3 a").first().click();
  await held.requested;
  await page.getByRole("heading", { name: "Cargando la propiedad", exact: true }).waitFor();
  expect(await page.getByRole("heading", { name: "Cargando la propiedad", exact: true }).isVisible()).toBe(true);
  expect(await page.evaluate(() => scrollY)).toBe(scroll);
  expect(await page.locator(".navigation-loading").evaluate((element) => element.getBoundingClientRect().top)).toBe(80);
  held.release();
  await page.waitForURL("**/property/*");
  await expect.poll(loaderActive).toBe(0);
  await page.locator("main article h1").waitFor();
  expect(await page.getByRole("heading", { name: "Características", exact: true }).isVisible()).toBe(true);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
});

test("ScrollRestoration restaura el historial sin intervención del loading", async () => {
  await page.goto(baseURL);
  await page.locator("footer").scrollIntoViewIfNeeded();
  const scroll = await page.evaluate(() => scrollY);
  await page.getByRole("navigation", { name: "Navegación principal", exact: true }).getByRole("link", { name: "Guardados", exact: true }).click();
  await page.waitForURL("**/favorites");
  await page.goBack();
  await page.getByRole("heading", { name: "Explora propiedades en Chile", exact: true }).waitFor({ state: "attached" });
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(scroll);
});

test("un enlace externo no inicia una navegación del router", async () => {
  await page.goto(baseURL);
  await context.route("https://external.example/**", (route) => route.fulfill({ contentType: "text/html", body: "<title>Destino externo de prueba</title>" }));
  await page.evaluate(() => {
    const link = document.createElement("a");
    link.href = "https://external.example/";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Enlace externo de prueba";
    document.querySelector("main").prepend(link);
  });
  const popup = page.waitForEvent("popup");
  await page.getByRole("link", { name: "Enlace externo de prueba", exact: true }).click();
  const external = await popup;
  expect(await loaderActive()).toBe(0);
  expect(page.url()).toBe(`${baseURL}/`);
  await external.close();
});

async function firstProperty(target) {
  const card = target.locator("main article").first();
  await card.waitFor();
  const href = await card.locator("h3 a").getAttribute("href");
  return { card, button: card.getByRole("button"), id: Number(href.split("/").pop()), href };
}

async function expectFavoriteCount(target, count) {
  const label = count ? `Guardados, ${count} ${count === 1 ? "propiedad" : "propiedades"}` : "Guardados";
  for (const name of ["Navegación principal", "Navegación móvil"]) {
    await expect.poll(() => target.locator(`nav[aria-label="${name}"] a[href="/favorites"]`).getAttribute("aria-label")).toBe(label);
  }
}

test("favoritos: guardar desde la card no navega y quitar desde favoritos recupera el estado vacío", async () => {
  await page.goto(`${baseURL}/favorites`);
  await page.getByRole("heading", { name: "Aún no has guardado propiedades", exact: true }).waitFor();
  await page.getByRole("link", { name: "Explorar propiedades", exact: true }).click();
  await page.waitForURL("**/search?filters=all");
  const { button, id } = await firstProperty(page);
  const url = page.url();
  await button.focus();
  await page.keyboard.press("Space");
  await expect.poll(() => button.getAttribute("aria-pressed")).toBe("true");
  expect(await button.locator("svg").getAttribute("fill")).toBe("currentColor");
  expect(page.url()).toBe(url);
  await expectFavoriteCount(page, 1);
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), FAVORITES_STORAGE_KEY)).toEqual([id]);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole("navigation", { name: "Navegación móvil", exact: true }).getByRole("link", { name: "Guardados, 1 propiedad", exact: true }).click();
  await page.waitForURL("**/favorites");
  await expect.poll(() => page.locator("main article").count()).toBe(1);
  expect(await page.locator("main article h3 a").getAttribute("href")).toBe(`/property/${id}`);
  const savedButton = page.locator("main article").getByRole("button");
  expect(await savedButton.getAttribute("aria-pressed")).toBe("true");
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations).toEqual([]);
  await savedButton.click();
  await page.getByRole("heading", { name: "Aún no has guardado propiedades", exact: true }).waitFor();
  expect(page.url()).toBe(`${baseURL}/favorites`);
  await expectFavoriteCount(page, 0);
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), FAVORITES_STORAGE_KEY)).toEqual([]);
});

test("favoritos: persisten al recargar y cerrar/reabrir el navegador", async () => {
  const profile = await mkdtemp(join(tmpdir(), "homeestate-favorites-"));
  const options = { executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome", args: ["--no-sandbox"] };
  let persistentContext;
  try {
    persistentContext = await chromium.launchPersistentContext(profile, options);
    let tab = await persistentContext.newPage();
    await tab.goto(`${baseURL}/search?filters=all`);
    const { button, id } = await firstProperty(tab);
    await button.click();
    await expectFavoriteCount(tab, 1);
    await tab.reload();
    await expectFavoriteCount(tab, 1);
    await expect.poll(() => tab.locator("main article").first().getByRole("button").getAttribute("aria-pressed")).toBe("true");
    await persistentContext.close();
    persistentContext = await chromium.launchPersistentContext(profile, options);
    tab = await persistentContext.newPage();
    await tab.goto(`${baseURL}/favorites`);
    await expect.poll(() => tab.locator("main article").count()).toBe(1);
    expect(await tab.locator("main article h3 a").getAttribute("href")).toBe(`/property/${id}`);
    await expectFavoriteCount(tab, 1);
  } finally {
    await persistentContext?.close();
    await rm(profile, { recursive: true, force: true });
  }
});

test("favoritos: dos pestañas sincronizan cards, contadores y eliminación sin recargar", async () => {
  await page.goto(`${baseURL}/search?filters=all`);
  const { button, href } = await firstProperty(page);
  const second = await context.newPage();
  await second.goto(`${baseURL}/favorites`);
  await second.getByRole("heading", { name: "Aún no has guardado propiedades", exact: true }).waitFor();
  await button.click();
  await expect.poll(() => second.locator("main article").count()).toBe(1);
  expect(await second.locator("main article h3 a").getAttribute("href")).toBe(href);
  await expectFavoriteCount(page, 1);
  await expectFavoriteCount(second, 1);
  await second.locator("main article").getByRole("button").click();
  await expect.poll(() => button.getAttribute("aria-pressed")).toBe("false");
  expect(await button.locator("svg").getAttribute("fill")).toBe("none");
  await expectFavoriteCount(page, 0);
  await expectFavoriteCount(second, 0);
  await button.click();
  await expect.poll(() => second.locator("main article").count()).toBe(1);
  await button.click();
  await second.getByRole("heading", { name: "Aún no has guardado propiedades", exact: true }).waitFor();
  expect(page.url()).toBe(`${baseURL}/search?filters=all`);
});

test("favoritos: JSON corrupto se repara sin perder persistencia", async () => {
  await page.goto(baseURL);
  await page.evaluate((key) => localStorage.setItem(key, "{invalid"), FAVORITES_STORAGE_KEY);
  await page.goto(`${baseURL}/favorites`);
  await page.reload();
  await page.getByRole("heading", { name: "Aún no has guardado propiedades", exact: true }).waitFor();
  expect(await page.getByText("Se guardan solo en este navegador, sin crear una cuenta.", { exact: true }).isVisible()).toBe(true);
  await page.getByRole("link", { name: "Explorar propiedades", exact: true }).click();
  const { button, id } = await firstProperty(page);
  await button.click();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), FAVORITES_STORAGE_KEY)).toEqual([id]);
  await page.reload();
  await expectFavoriteCount(page, 1);
  await expect.poll(() => page.locator("main article").first().getByRole("button").getAttribute("aria-pressed")).toBe("true");
});

test("favoritos: elimina duplicados e IDs inexistentes y actualiza la selección al quitar", async () => {
  await page.goto(baseURL);
  await page.evaluate((key) => localStorage.setItem(key, '[1,1,2,"2",-1,99999]'), FAVORITES_STORAGE_KEY);
  await page.goto(`${baseURL}/favorites`);
  await page.reload();
  await expect.poll(() => page.locator("main article").count()).toBe(2);
  await expectFavoriteCount(page, 2);
  expect(await page.locator("main article h3 a").evaluateAll((links) => links.map((link) => link.getAttribute("href")))).toEqual(["/property/1", "/property/2"]);
  await page.locator("main article").first().getByRole("button").click();
  await expect.poll(() => page.locator("main article").count()).toBe(1);
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), FAVORITES_STORAGE_KEY)).toEqual([2]);
  await expectFavoriteCount(page, 1);
});

test.each(["getItem", "setItem"])("favoritos: un fallo de %s mantiene las interacciones y avisa de la sesión en memoria", async (method) => {
  await page.addInitScript(({ key, operation }) => {
    const original = Storage.prototype[operation];
    Storage.prototype[operation] = function (entry, ...args) {
      if (entry === key) throw new DOMException("Storage unavailable", "SecurityError");
      return original.call(this, entry, ...args);
    };
  }, { key: FAVORITES_STORAGE_KEY, operation: method });
  await page.goto(`${baseURL}/search?filters=all`);
  const { button } = await firstProperty(page);
  await button.click();
  await expect.poll(() => button.getAttribute("aria-pressed")).toBe("true");
  await expectFavoriteCount(page, 1);
  await page.getByRole("navigation", { name: "Navegación principal", exact: true }).getByRole("link", { name: "Guardados, 1 propiedad", exact: true }).click();
  await expect.poll(() => page.locator("main article").count()).toBe(1);
  expect(await page.getByText(/La selección se conserva solo en esta pestaña/).isVisible()).toBe(true);
  await page.locator("main article").getByRole("button").click();
  await page.getByRole("heading", { name: "Aún no has guardado propiedades", exact: true }).waitFor();
  await expectFavoriteCount(page, 0);
});

test.each(["portada", "resultados", "favoritos"])("detalle: abrir una card desde %s renderiza la ficha sin errores de módulos", async (source) => {
  const errors = [];
  const serverErrors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.url().startsWith(baseURL) && response.status() >= 500) serverErrors.push(response.status());
  });
  if (source === "favoritos") {
    await page.addInitScript(({ key, id }) => localStorage.setItem(key, JSON.stringify([id])), { key: FAVORITES_STORAGE_KEY, id: properties[0].id });
  }
  await page.goto(source === "portada" ? baseURL : `${baseURL}/${source === "resultados" ? "search?filters=all" : "favorites"}`);
  const { card, id, href } = await firstProperty(page);
  const property = properties.find((entry) => entry.id === id);
  if (source === "resultados") await card.locator(`a[href="${href}"]`).first().click();
  else await card.locator("h3 a").click();
  await page.getByRole("heading", { level: 1, name: property.title, exact: true }).waitFor();
  expect(page.url()).toBe(`${baseURL}${href}`);
  expect(await page.getByRole("heading", { name: "Características", exact: true }).isVisible()).toBe(true);
  expect(await page.getByRole("heading", { name: "Descripción", exact: true }).isVisible()).toBe(true);
  expect(await page.getByRole("heading", { name: "No se pudo cargar la página", exact: true }).count()).toBe(0);
  expect(serverErrors).toEqual([]);
  expect(errors).toEqual([]);
});

test("detalle: la URL directa, recarga y galería funcionan con sus dependencias lazy", async () => {
  const property = properties[0];
  const failures = [];
  page.on("response", (response) => {
    if (response.url().startsWith(baseURL) && response.status() >= 500) failures.push(response.status());
  });
  await page.goto(`${baseURL}/property/${property.id}`);
  await page.getByRole("heading", { level: 1, name: property.title, exact: true }).waitFor();
  await page.reload();
  await page.getByRole("heading", { level: 1, name: property.title, exact: true }).waitFor();
  const galleryTrigger = page.getByRole("button", { name: /^Ampliar fotografía 1 de/ });
  await galleryTrigger.click();
  await page.getByRole("dialog", { name: "Galería de la propiedad", exact: true }).waitFor();
  await page.keyboard.press("Escape");
  await page.getByRole("dialog", { name: "Galería de la propiedad", exact: true }).waitFor({ state: "hidden" });
  await expect.poll(() => galleryTrigger.evaluate((element) => element === document.activeElement)).toBe(true);
  expect(failures).toEqual([]);
  expect(await page.getByRole("heading", { level: 1, name: property.title, exact: true }).isVisible()).toBe(true);
});

test.each(["house", "apartment", "land", "office"])("detalle: %s conserva datos, accesibilidad y diseño responsive", async (type) => {
  const property = properties.find((entry) => entry.type === type);
  await page.goto(`${baseURL}/property/${property.id}`);
  await page.getByRole("heading", { level: 1, name: property.title, exact: true }).waitFor();
  const features = page.getByRole("region", { name: "Características", exact: true });
  expect(await features.getByText("Dormitorios", { exact: true }).count()).toBe(["house", "apartment"].includes(type) ? 1 : 0);
  expect(await features.getByText("Baños", { exact: true }).count()).toBe(type === "land" ? 0 : 1);
  expect(await features.getByText(`${property.area.toLocaleString("es-CL")} m²`, { exact: true }).count()).toBe(1);
  for (const width of [320, 375, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const price = await page.getByText(`$${property.price.toLocaleString("es-CL")}`, { exact: true }).boundingBox();
    expect(price.x).toBeGreaterThanOrEqual(0);
    expect(price.x + price.width).toBeLessThanOrEqual(width);
  }
  const similarHref = await page.getByRole("link", { name: "Explorar propiedades similares", exact: true }).getAttribute("href");
  const similar = new URL(similarHref, baseURL);
  expect(similar.searchParams.get("city")).toBe(property.city);
  expect(similar.searchParams.get("type")).toBe(type);
  const mapHref = await page.getByRole("link", { name: "Ver zona en el mapa", exact: true }).getAttribute("href");
  const map = new URL(mapHref, baseURL);
  expect(map.pathname).toBe("/map");
  expect(map.searchParams.get("city")).toBe(property.city);
  expect(map.searchParams.get("district")).toBe(property.district);
  await page.setViewportSize({ width: 375, height: 812 });
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations).toEqual([]);
  if (type === "house") {
    await page.setViewportSize({ width: 1440, height: 1000 });
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations).toEqual([]);
  }
});

test("detalle: guardar sincroniza navegación, persiste y permite recuperar la ficha", async () => {
  const property = properties[0];
  await page.goto(`${baseURL}/property/${property.id}`);
  const save = page.getByRole("button", { name: `Guardar: ${property.title}, referencia ${property.id}`, exact: true });
  await save.focus();
  await page.keyboard.press("Space");
  await expectFavoriteCount(page, 1);
  expect(new URL(page.url()).pathname).toBe(`/property/${property.id}`);
  const removeName = `Quitar de guardados: ${property.title}, referencia ${property.id}`;
  expect(await page.getByRole("button", { name: removeName, exact: true }).getAttribute("aria-pressed")).toBe("true");
  await page.reload();
  await page.getByRole("button", { name: removeName, exact: true }).waitFor();
  expect(await page.getByRole("button", { name: removeName, exact: true }).getAttribute("aria-pressed")).toBe("true");
  await page.getByRole("navigation", { name: "Navegación principal", exact: true }).getByRole("link", { name: "Guardados, 1 propiedad", exact: true }).click();
  await page.waitForURL("**/favorites");
  await page.locator(`main article h3 a[href="/property/${property.id}"]`).waitFor();
  expect(await page.locator(`main article h3 a[href="/property/${property.id}"]`).count()).toBe(1);
});

test("detalle: un ID inexistente no se confunde con un fallo de carga ni con la ruta 404", async () => {
  await page.goto(`${baseURL}/property/99999`);
  await page.getByRole("heading", { name: "Propiedad no encontrada", exact: true }).waitFor();
  expect(await page.getByRole("heading", { name: "No se pudo cargar la página", exact: true }).count()).toBe(0);
  await page.goto(`${baseURL}/ruta-inexistente`);
  await page.getByRole("heading", { name: "Esta página no está disponible", exact: true }).waitFor();
});