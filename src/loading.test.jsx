import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import Loading from "./loading.jsx";

test.each([
  ["/search", "Buscando propiedades"],
  ["/map", "Preparando el mapa"],
  ["/property/1", "Cargando la propiedad"],
  ["/favorites", "Cargando tus guardados"],
  ["/", "Cargando página"],
])("loading anuncia el destino %s y oculta los esqueletos a lectores de pantalla", (pathname, title) => {
  const html = renderToStaticMarkup(createElement(Loading, { pathname }));
  expect(html).toContain('role="status"');
  expect(html).toContain('aria-label="Cargando página"');
  expect(html).toContain('aria-live="polite"');
  expect(html).toContain('aria-hidden="true"');
  expect(html).toContain(title);
  expect(html).not.toMatch(/<button|<a\s|<img|<canvas/);
});

test("loading admite la carga inicial sin una ruta resuelta", () => {
  expect(renderToStaticMarkup(createElement(Loading))).toContain("Cargando página");
});