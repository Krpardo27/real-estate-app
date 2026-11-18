import { test, expect } from "vitest";
import { createPropertyClusterIndex, getPropertyClusters } from "../components/map/clusterProperties.js";

const property = (id, lng, lat) => Object.freeze({ id, lng, lat, title: `Propiedad ${id}` });
const nearby = Object.freeze([
  property(1, -70.61, -33.45),
  property(2, -70.6, -33.44),
  property(3, -70.62, -33.46),
]);
const ids = (groups) => groups.flatMap((group) => group.properties.map(({ id }) => id)).sort();

test("agrupa coordenadas cercanas y recupera todas las fichas sin mutar el catálogo", () => {
  const data = createPropertyClusterIndex(nearby);
  const groups = getPropertyClusters(data, 10);
  expect(groups.length).toBe(1);
  expect(ids(groups)).toStrictEqual([1, 2, 3]);
  expect(groups[0].properties.find(({ id }) => id === 1)).toBe(nearby[0]);
  expect(nearby[0].lng).toBe(-70.61);
});

test("el zoom final del fit sustituye los grupos del zoom inicial", () => {
  const properties = [property(1, -70.61, -33.45), property(2, -69.61, -33.45)];
  const data = createPropertyClusterIndex(properties);
  expect(getPropertyClusters(data, 10).length).toBe(2);
  expect(getPropertyClusters(data, 5).length).toBe(1);
  expect(getPropertyClusters(data, 10).length).toBe(2);
});

test("usa floor del zoom fraccional, incluido el nivel posterior a maxZoom 18", () => {
  const data = createPropertyClusterIndex(nearby);
  expect(getPropertyClusters(data, 5.99)).toStrictEqual(getPropertyClusters(data, 5));
  expect(getPropertyClusters(data, 18.99)).toStrictEqual(getPropertyClusters(data, 18));
  const groups = getPropertyClusters(data, 19);
  expect(groups.length).toBe(nearby.length);
  for (const group of groups) {
    const original = group.properties[0];
    expect(group.longitude).toBe(original.lng);
    expect(group.latitude).toBe(original.lat);
  }
});

test("las coincidencias exactas conservan todas sus fichas incluso a zoom 19", () => {
  const properties = [property(1, -70.61, -33.45), property(2, -70.61, -33.45)];
  const data = createPropertyClusterIndex(properties);
  for (const zoom of [0, 5, 10, 18, 19]) {
    const groups = getPropertyClusters(data, zoom);
    expect(groups.length).toBe(1);
    expect(ids(groups)).toStrictEqual([1, 2]);
    expect(groups[0].longitude).toBe(-70.61);
    expect(groups[0].latitude).toBe(-33.45);
  }
});

test("getLeaves no pierde fichas al superar el límite predeterminado de diez hojas", () => {
  const properties = Array.from({ length: 30 }, (_, i) => property(i, -70.61 + i / 10000, -33.45));
  const groups = getPropertyClusters(createPropertyClusterIndex(properties), 5);
  expect(groups.length).toBe(1);
  expect(groups[0].properties.length).toBe(30);
  expect(new Set(groups[0].properties.map(({ id }) => id)).size).toBe(30);
});

test("una propiedad conserva su identidad, título y coordenadas sin offsets", () => {
  const original = property(1, -70.61, -33.45);
  const data = createPropertyClusterIndex([original]);
  expect(getPropertyClusters(data, 13)[0]).toStrictEqual({
    key: JSON.stringify([original.lng, original.lat]),
    longitude: original.lng,
    latitude: original.lat,
    properties: [original],
  });
});

test("la clave del fit contiene solo centros únicos ordenados y no cambia con el zoom", () => {
  const data = createPropertyClusterIndex([...nearby, nearby[0]]);
  const key = data.coordinateKey;
  getPropertyClusters(data, 5);
  getPropertyClusters(data, 19);
  expect(data.coordinateKey).toBe(key);
  expect(createPropertyClusterIndex([...nearby].reverse()).coordinateKey).toBe(key);
  expect(JSON.parse(key)).toStrictEqual([[-70.62, -33.46], [-70.61, -33.45], [-70.6, -33.44]]);
});

test("excluye coordenadas inválidas y admite catálogos vacíos", () => {
  const data = createPropertyClusterIndex([
    ...nearby, property(4, null, -33), property(5, 181, -33),
    property(6, -70, NaN), property(7, "-70", -33), property(8, -70, 91),
  ]);
  expect(ids(getPropertyClusters(data, 5))).toStrictEqual([1, 2, 3]);
  for (const input of [[], null, undefined]) {
    const empty = createPropertyClusterIndex(input);
    expect(empty.coordinateKey).toBe("[]");
    expect(getPropertyClusters(empty, 5)).toStrictEqual([]);
  }
});