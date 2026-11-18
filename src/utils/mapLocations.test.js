import { test, expect } from "vitest";
import { buildMapLocations, findMapLocation, getLocationCoordinateKey, getMapSelectionSignature } from "../components/map/mapLocations.js";

const property = (id, city, district, lng = -70.61, lat = -33.45) =>
  Object.freeze({ id, city, district, lng, lat });

test("sugiere únicamente ciudades y comunas cartografiables de los resultados actuales", () => {
  const data = Object.freeze([
    property(1, "Santiago", "Ñuñoa"),
    property(2, "Santiago", "Providencia", -70.6),
    property(3, "Valparaíso", "Valparaíso", -71.6, -33.04),
    property(4, "Talca", "Talca", null),
  ]);
  const locations = buildMapLocations(data);
  expect(locations.map(({ label }) => label)).toStrictEqual(["Ñuñoa, Santiago", "Providencia, Santiago", "Santiago", "Valparaíso"]);
  expect(findMapLocation(locations, "Santiago").properties.length).toBe(2);
  expect(findMapLocation(buildMapLocations([data[0]]), "Providencia")).toBe(null);
  expect(data[0].district).toBe("Ñuñoa");
});

test("normaliza tildes, mayúsculas y espacios sin búsqueda parcial ni zonas inventadas", () => {
  const locations = buildMapLocations([property(1, "Santiago", "Ñuñoa")]);
  expect(findMapLocation(locations, "  NUNOA  ").label).toBe("Ñuñoa, Santiago");
  expect(findMapLocation(locations, "Nunoa,   SANTIAGO").label).toBe("Ñuñoa, Santiago");
  for (const query of ["", "   ", "Ñu", "La Serena", "<script>"]) {
    expect(findMapLocation(locations, query)).toBe(null);
  }
});

test("los nombres de comuna ambiguos exigen una sugerencia con ciudad", () => {
  const locations = buildMapLocations([
    property(1, "Ciudad A", "Centro"), property(2, "Ciudad B", "Centro"),
  ]);
  expect(findMapLocation(locations, "Centro")).toBe(null);
  expect(findMapLocation(locations, "Centro, Ciudad A").properties[0].id).toBe(1);
});

test("el ajuste de zona usa solo coordenadas reales únicas, ordenadas y válidas", () => {
  const data = [property(1, "Santiago", "Ñuñoa"), property(2, "Santiago", "Ñuñoa"), property(3, "Santiago", "Providencia", -70.7, -33.5)];
  const key = getLocationCoordinateKey(data);
  expect(key).toBe(getLocationCoordinateKey([...data].reverse()));
  expect(JSON.parse(key)).toStrictEqual([[-70.7, -33.5], [-70.61, -33.45]]);
  expect(findMapLocation(buildMapLocations(data), "Santiago").coordinateKey).toBe(key);
  expect(getLocationCoordinateKey([property(4, "X", "Y", 181), property(5, "X", "Y", "-70")])).toBe("[]");
});

test("la firma cierra selecciones al cambiar IDs, no al reordenar", () => {
  const a = property(1, "A", "A");
  const b = property(2, "B", "B");
  expect(getMapSelectionSignature([a, b])).toBe(getMapSelectionSignature([b, a]));
  expect(getMapSelectionSignature([a, b])).not.toBe(getMapSelectionSignature([a]));
  expect(getMapSelectionSignature([a])).not.toBe(getMapSelectionSignature([{ ...a, id: "1" }]));
});

test("tolera catálogos vacíos y campos geográficos ausentes sin inferir comunas de location", () => {
  for (const input of [null, undefined, []]) {
    expect(buildMapLocations(input)).toStrictEqual([]);
    expect(getLocationCoordinateKey(input)).toBe("[]");
    expect(getMapSelectionSignature(input)).toBe("[]");
  }
  expect(buildMapLocations([{ id: 1, lng: -70, lat: -33, location: "Barrio, Ciudad" }])).toStrictEqual([]);
});