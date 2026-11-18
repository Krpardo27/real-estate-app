import { test, expect } from "vitest";
import {
  FILTER_KEYS, DEFAULT_PROPERTY_FILTERS, DEFAULT_SEARCH_QUERY,
  initializePropertySearch, clearPropertyFilters, applyDefaultPropertyFilters,
  filterProperties, parsePropertyFilters, updatePropertyFilter, formatFilterValue,
} from "./propertyFilters.js";

const catalogue = [
  { id: 1, region: 13, city: "Santiago", district: "Ñuñoa", type: "apartment", price: 200, bedrooms: 2, bathrooms: 1, area: 60 },
  { id: 2, region: 13, city: "Santiago", district: "Providencia", type: "house", price: 100, bedrooms: 3, bathrooms: 2, area: 90 },
  { id: 3, region: 4, city: "La Serena", district: "La Serena", type: "land", price: 300, bedrooms: 0, bathrooms: 0, area: 400 },
  { id: 4, region: 13, city: "Santiago", district: "Ñuñoa", type: "apartment", price: 200, bedrooms: 1, bathrooms: 1, area: 40 },
];
const params = (query = "") => new URLSearchParams(query);
const ids = (query) => filterProperties(catalogue, params(query)).map((property) => property.id);

test("inicializa región, tipo y precio sin perder parámetros de navegación ni mutar la URL", () => {
  expect(DEFAULT_PROPERTY_FILTERS).toStrictEqual({ region: "13", type: "apartment", price: "350000000" });
  expect(DEFAULT_SEARCH_QUERY).toBe(new URLSearchParams(DEFAULT_PROPERTY_FILTERS).toString());
  expect(initializePropertySearch(params()).toString()).toBe(DEFAULT_SEARCH_QUERY);
  const original = params("utm_source=demo&sort=price-asc&view=map");
  const initialized = initializePropertySearch(original);
  expect(initialized.get("region")).toBe("13");
  expect(initialized.get("type")).toBe("apartment");
  expect(initialized.get("price")).toBe("350000000");
  for (const key of ["utm_source", "sort", "view"]) expect(initialized.get(key)).toBe(original.get(key));
  expect(original.toString()).toBe("utm_source=demo&sort=price-asc&view=map");
  expect(initializePropertySearch(initialized).toString()).toBe(initialized.toString());
  expect(filterProperties(catalogue, initialized).map((entry) => entry.id)).toStrictEqual([1, 4]);
});

test("no añade defaults a ningún criterio explícito, vacío o inválido, ni a filters=all", () => {
  for (const key of FILTER_KEYS) {
    for (const value of ["", "invalido"]) {
      const original = params(`utm_source=demo&${key}=${value}`);
      expect(initializePropertySearch(original).toString()).toBe(original.toString());
    }
  }
  for (const query of ["city=Santiago", "district=Ñuñoa", "region=4", "type=house", "filters=all&view=map"]) {
    const original = params(query);
    expect(initializePropertySearch(original).toString()).toBe(original.toString());
  }
});

test("limpiar elimina filtros y página, mantiene navegación y evita resucitar el preset", () => {
  const original = params("region=13&city=Santiago&district=Ñuñoa&type=house&price=123&bedrooms=2&bathrooms=1&area=40&page=3&sort=price-desc&view=map&utm_source=demo&utm_source=otro");
  const cleared = clearPropertyFilters(original);
  for (const key of [...FILTER_KEYS, "page"]) expect(cleared.has(key)).toBe(false);
  expect(cleared.get("filters")).toBe("all");
  expect(cleared.get("sort")).toBe("price-desc");
  expect(cleared.get("view")).toBe("map");
  expect(cleared.getAll("utm_source")).toStrictEqual(["demo", "otro"]);
  expect(initializePropertySearch(cleared).toString()).toBe(cleared.toString());
  expect(original.get("page")).toBe("3");
  expect(original.get("district")).toBe("Ñuñoa");
});

test("restablecer aplica solo el preset y conserva sort, view y campañas", () => {
  const original = params("filters=all&city=Talca&district=Talca&type=land&price=123&bedrooms=4&bathrooms=2&area=300&page=9&sort=price-asc&view=list&utm_campaign=demo");
  const restored = applyDefaultPropertyFilters(original);
  expect(parsePropertyFilters(restored)).toStrictEqual({ region: "13", type: "apartment", price: 350000000, sort: "price-asc" });
  for (const key of ["city", "district", "bedrooms", "bathrooms", "area", "page", "filters"]) {
    expect(restored.has(key)).toBe(false);
  }
  for (const key of ["sort", "view", "utm_campaign"]) expect(restored.get(key)).toBe(original.get(key));
  expect(original.get("city")).toBe("Talca");
});

test("ciudad sola es canónica del catálogo y una comuna no se interpreta como ciudad", () => {
  expect(parsePropertyFilters(params("city=+SANTIAGO+"))).toStrictEqual({ city: "Santiago" });
  expect(ids("city=Santiago")).toStrictEqual([1, 2, 4]);
  expect(parsePropertyFilters(params("city=+nunoa+"))).toStrictEqual({});
  expect(parsePropertyFilters(params("district=+nunoa+"))).toStrictEqual({ district: "Ñuñoa" });
  expect(ids("district=Ñuñoa")).toStrictEqual([1, 4]);
  // La comuna administrativa sigue siendo válida aunque no exista en el catálogo demo.
  expect(parsePropertyFilters(params("district=Santiago"))).toStrictEqual({ district: "Santiago" });
});

test("normaliza tildes, mayúsculas, espacios, tipo y región con cero inicial", () => {
  expect(ids("region=013&city=+SANTIAGO+&district=+nunoa+&type=APARTMENT")).toStrictEqual([1, 4]);
  expect(parsePropertyFilters(params("region=04&city=LA++SERENA")).city).toBe("La Serena");
});

test("combina máximo de precio y mínimos de dormitorios, baños y superficie", () => {
  expect(ids("price=200&bedrooms=2&bathrooms=1&area=60")).toStrictEqual([1, 2]);
  expect(ids("price=100&bedrooms=3&bathrooms=2&area=90")).toStrictEqual([2]);
  expect(ids("price=0")).toStrictEqual([]);
  expect(ids("bedrooms=0&bathrooms=0")).toStrictEqual([1, 2, 3, 4]);
});

test("ignora enums, regiones, comunas y números inválidos sin parseos parciales", () => {
  for (const value of ["-1", "Infinity", "NaN", "0x20", "1e3", "12pesos", "9007199254740992", ""]) {
    expect(ids(`price=${value}`)).toStrictEqual([1, 2, 3, 4]);
  }
  expect(parsePropertyFilters(params("region=99&district=Centro&city=Atlantida&type=castle&sort=random&bedrooms=1.5&bathrooms=-2"))).toStrictEqual({});
  expect(ids("price=+200.5+")).toStrictEqual([1, 2, 4]);
});

test("ordena precio asc/desc estable y no muta ni catálogo ni URL", () => {
  const before = structuredClone(catalogue);
  const query = params("sort=price-asc&utm_source=demo");
  expect(filterProperties(catalogue, query).map((property) => property.id)).toStrictEqual([2, 1, 4, 3]);
  expect(ids("sort=price-desc")).toStrictEqual([3, 1, 4, 2]);
  expect(catalogue).toStrictEqual(before);
  expect(query.toString()).toBe("sort=price-asc&utm_source=demo");
  expect(filterProperties(catalogue, params())).not.toBe(catalogue);
});

test("precios no finitos van al final en ambos órdenes y no pasan límites", () => {
  const entries = [{ id: 1, price: NaN }, { id: 2, price: 10 }, { id: 3, price: Infinity }, { id: 4, price: null }];
  for (const sort of ["price-asc", "price-desc"]) {
    expect(filterProperties(entries, params(`sort=${sort}`)).map((property) => property.id)).toStrictEqual([2, 1, 3, 4]);
  }
  expect(filterProperties(entries, params("price=20")).map((property) => property.id)).toStrictEqual([2]);
});

test("cambiar o quitar región limpia comuna; solo borra ciudad incompatible", () => {
  const initial = params("region=13&city=Santiago&district=Ñuñoa&sort=price-desc&utm_source=demo");
  const changed = updatePropertyFilter(initial, "region", "4");
  expect(changed.get("region")).toBe("4");
  expect(changed.has("district")).toBe(false);
  expect(changed.has("city")).toBe(false);
  expect(changed.get("sort")).toBe("price-desc");
  expect(changed.get("utm_source")).toBe("demo");
  expect(initial.get("district")).toBe("Ñuñoa");
  const removed = updatePropertyFilter(initial, "region", "");
  expect(removed.has("region")).toBe(false);
  expect(removed.has("district")).toBe(false);
  expect(removed.get("city")).toBe("Santiago");
  expect(updatePropertyFilter(initial, "region", "13").get("city")).toBe("Santiago");
});

test("chips solo usan filtros y nombres legibles; sort no se modifica como filtro", () => {
  expect(FILTER_KEYS.includes("sort")).toBe(false);
  expect(FILTER_KEYS.includes("utm_source")).toBe(false);
  expect(formatFilterValue("type", "apartment")).toBe("Departamento");
  expect(formatFilterValue("region", "04")).toBe("Coquimbo");
  expect(formatFilterValue("price", 200000000)).toMatch(/CLP/);
  expect(updatePropertyFilter(params("sort=price-asc"), "sort", "price-desc").get("sort")).toBe("price-asc");
});

test("elegir ciudad limpia comuna y región incompatibles, sin imponer otra región", () => {
  const original = params("region=13&city=Santiago&district=Ñuñoa&type=house&page=2&sort=price-desc&view=map&utm_source=demo");
  const changed = updatePropertyFilter(original, "city", "La Serena");
  expect(changed.get("city")).toBe("La Serena");
  for (const key of ["region", "district", "page", "filters"]) expect(changed.has(key)).toBe(false);
  for (const key of ["type", "sort", "view", "utm_source"]) expect(changed.get(key)).toBe(original.get(key));
  const compatible = updatePropertyFilter(original, "city", "Santiago");
  expect(compatible.get("region")).toBe("13");
  expect(compatible.get("district")).toBe("Ñuñoa");
  expect(original.get("district")).toBe("Ñuñoa");
});

test("quitar ciudad mantiene comuna, región y criterios independientes", () => {
  const removed = updatePropertyFilter(params("region=13&city=Santiago&district=Ñuñoa&type=apartment&price=200"), "city", "");
  expect(parsePropertyFilters(removed)).toStrictEqual({ region: "13", district: "Ñuñoa", type: "apartment", price: 200 });
  expect(removed.has("city")).toBe(false);
  expect(removed.has("filters")).toBe(false);
});

test("quitar el último chip marca filters=all y establecer un criterio elimina la marca", () => {
  for (const key of FILTER_KEYS) {
    const removed = updatePropertyFilter(params(`${key}=valor&page=2&sort=price-asc&view=map&utm_source=demo`), key, "");
    expect(removed.get("filters")).toBe("all");
    expect(removed.has("page")).toBe(false);
    expect(initializePropertySearch(removed).toString()).toBe(removed.toString());
    expect(removed.get("sort")).toBe("price-asc");
    expect(removed.get("view")).toBe("map");
    expect(removed.get("utm_source")).toBe("demo");
  }
  const changed = updatePropertyFilter(params("filters=all&view=map"), "type", "house");
  expect(changed.has("filters")).toBe(false);
  expect(parsePropertyFilters(changed)).toStrictEqual({ type: "house" });
  const withoutRegion = updatePropertyFilter(params("region=13&district=Ñuñoa"), "region", "");
  expect(withoutRegion.get("filters")).toBe("all");
});