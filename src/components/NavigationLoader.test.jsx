import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, test, vi } from "vitest";
import NavigationLoader from "./NavigationLoader.jsx";

const router = vi.hoisted(() => ({ navigation: { state: "idle" } }));
vi.mock("react-router-dom", () => ({ useNavigation: () => router.navigation }));

const render = () => renderToStaticMarkup(createElement(NavigationLoader));

beforeEach(() => {
  router.navigation = { state: "idle" };
});

test("no muestra progreso cuando no existe navegación", () => {
  expect(render()).toBe("");
});

test.each(["loading", "submitting"])("anuncia una navegación %s hacia otro pathname", (state) => {
  router.navigation = { state, location: { pathname: "/search" } };
  const html = render();
  expect(html).toContain('class="navigation-loading"');
  expect(html).toContain('aria-live="polite"');
  expect(html).toContain("Buscando propiedades");
  expect(html).toContain('aria-hidden="true"');
  expect(html).not.toMatch(/aria-valuenow|<button|<a\s/);
});

test.each([
  { pathname: "/search" },
  { pathname: "/search", search: "?price=350000000" },
  { pathname: "/search", hash: "#resultados" },
])("usa el pathname pendiente sin depender de query o hash: %j", (location) => {
  router.navigation = { state: "loading", location };
  expect(render()).toContain("Buscando propiedades");
});

test("el estado idle limpia el skeleton tras terminar, cancelar o gestionar un error", () => {
  for (const navigation of [{ state: "idle" }, { state: "idle", location: { pathname: "/favorites" } }]) {
    router.navigation = navigation;
    expect(render()).toBe("");
  }
});

test("soporta navegaciones consecutivas sin estado ni indicadores duplicados", () => {
  for (const pathname of ["/favorites", "/search", "/property/1"]) {
    router.navigation = { state: "loading", location: { pathname } };
    const html = render();
    expect(html).toContain('class="navigation-loading"');
    expect(html.match(/role="status"/g)).toHaveLength(1);
    router.navigation = { state: "idle" };
    expect(render()).toBe("");
  }
});

test.each([
  ["/search", "Buscando propiedades"],
  ["/map", "Preparando el mapa"],
  ["/property/1", "Cargando la propiedad"],
  ["/favorites", "Cargando tus guardados"],
  ["/", "Cargando página"],
])("selecciona el skeleton de destino %s", (pathname, title) => {
  router.navigation = { state: "loading", location: { pathname } };
  expect(render()).toContain(title);
});

test("no intenta leer la ruta cuando no hay destino pendiente", () => {
  router.navigation = { state: "loading" };
  expect(render()).toBe("");
});