import { test, expect } from "vitest";
import { DEMO_LOCATIONS, DEMO_SEED, generateProperties } from "./generateProperties.js";
import { properties } from "../data/properties.js";
import { cities } from "../data/cities.js";
import { chileRegions } from "../data/regions.js";
import { getMappableProperties } from "../components/map/coordinates.js";

test("semilla reproducible, IDs estables y prefijo conservado al ampliar catálogo", () => {
  expect(generateProperties()).toStrictEqual(generateProperties());
  // Las fotos son editoriales y se pueden sustituir sin modificar identidad/precio.
  const withoutImages = (catalog) => catalog.map((property) => ({ ...property, images: [] }));
  expect(withoutImages(properties)).toStrictEqual(withoutImages(generateProperties(120, DEMO_SEED)));
  expect(generateProperties(10)).toStrictEqual(generateProperties(20).slice(0, 10));
  expect(generateProperties(10, 1)).not.toStrictEqual(generateProperties(10, 2));
  expect(generateProperties(10).map((property) => property.id)).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  expect(new Set(properties.map((property) => property.id)).size).toBe(properties.length);
  expect(generateProperties(0)).toStrictEqual([]);
  for (const count of [-1, 1.5, Infinity, "10", 100001]) expect(() => generateProperties(count)).toThrow(RangeError);
  expect(() => generateProperties(1, NaN)).toThrow(TypeError);
});

test("cada comuna pertenece a su región y ciudad, sin barrios como comunas", () => {
  for (const property of generateProperties(1000)) {
    const region = chileRegions.find((entry) => Number(entry.id) === property.region);
    const city = DEMO_LOCATIONS.find((entry) => entry.city === property.city);
    expect(region?.communes.includes(property.district)).toBeTruthy();
    expect(city.region).toBe(property.region);
    const district = city.districts.find((entry) => entry.name === property.district);
    expect(district).toBeTruthy();
    expect(property.lat).toBe(district.lat);
    expect(property.lng).toBe(district.lng);
    expect(property.isDemo).toBe(true);
    expect(property.description).toMatch(/demostración/);
    expect(property.images.length).toBe(1);
    expect(property.images[0].startsWith("https://images.unsplash.com/")).toBeTruthy();
  }
});

test("contadores de ciudades derivados del mismo catálogo demo", () => {
  expect(cities.reduce((sum, city) => sum + city.properties, 0)).toBe(properties.length);
  for (const city of cities) {
    expect(city.properties).toBe(properties.filter((property) => property.city === city.name).length);
    expect(city.isDemo).toBe(true);
  }
});

test("mapa y bounds comparten coordenadas finitas dentro de rangos WGS84", () => {
  const valid = [{ lat: 0, lng: 0 }, { lat: -90, lng: -180 }, { lat: 90, lng: 180 }];
  const invalid = [null, {}, { lat: "0", lng: 0 }, { lat: null, lng: 0 }, { lat: NaN, lng: 1 }, { lat: 1, lng: Infinity }, { lat: 91, lng: 0 }, { lat: 0, lng: -181 }];
  expect(getMappableProperties([...valid, ...invalid])).toStrictEqual(valid);
  expect(getMappableProperties(invalid)).toStrictEqual([]);
  expect(getMappableProperties(undefined)).toStrictEqual([]);
  expect(getMappableProperties(properties).length).toBe(properties.length);
});