import { test, expect } from "vitest";
import { buildNavigationDestinations } from "./navigation.js";

test("Buscar elimina view=map y mantiene filtros, orden y página", () => {
  for (const pathname of ["/search", "/map"]) {
    const destinations = buildNavigationDestinations({ pathname, search: "?view=map&type=house&price=350000000&sort=price-asc&page=2&filters=all" });
    expect(destinations.find((entry) => entry.key === "search").to).toBe("/search?type=house&price=350000000&sort=price-asc&page=2&filters=all");
    expect(destinations.find((entry) => entry.key === "map").to).toBe("/map?type=house&price=350000000&sort=price-asc&page=2&filters=all");
    expect(destinations.filter((entry) => entry.active).map((entry) => entry.key)).toStrictEqual(["map"]);
  }
});

test("el estado activo reconoce cada sección y no activa opciones en el detalle", () => {
  for (const [pathname, key] of [["/", "home"], ["/search", "search"], ["/map", "map"], ["/favorites", "favorites"], ["/property/1", undefined]]) {
    const active = buildNavigationDestinations({ pathname }).filter((entry) => entry.active);
    expect(active.map((entry) => entry.key)).toStrictEqual(key ? [key] : []);
  }
});

test("fuera de búsqueda y mapa no copia parámetros ajenos y mantiene cuatro destinos", () => {
  const destinations = buildNavigationDestinations({ pathname: "/", search: "?view=map&utm_source=demo" });
  expect(destinations.map((entry) => entry.to)).toStrictEqual(["/", "/search", "/map", "/favorites"]);
});

test("conserva parámetros repetidos y no genera un signo de interrogación vacío", () => {
  const repeated = buildNavigationDestinations({ pathname: "/search", search: "?utm_source=uno&utm_source=dos&district=%C3%91u%C3%B1oa&view=map" });
  expect(repeated.find((entry) => entry.key === "search").to).toBe("/search?utm_source=uno&utm_source=dos&district=%C3%91u%C3%B1oa");
  const empty = buildNavigationDestinations({ pathname: "/search", search: "?view=map" });
  expect(empty.find((entry) => entry.key === "search").to).toBe("/search");
});