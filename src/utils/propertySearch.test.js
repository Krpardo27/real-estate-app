import { test, expect } from "vitest";
import { chileRegions } from "../data/regions.js";
import { propertyTypes } from "../data/propertyTypes.js";
import { PROPERTY_PRICE_LIMITS, initializePropertySearch, filterProperties } from "./propertyFilters.js";
import { generateProperties } from "./generateProperties.js";
import { buildPropertySearchParams } from "./propertySearch.js";
import { propertySearchSchema } from "../components/property-search/schemas/propertySearch.schema.js";

const emptyValues = { region: "", district: "", type: "", price: "" };
const validate = (values) => propertySearchSchema.safeParse({ ...emptyValues, ...values });

test("esquema acepta todos los campos vacíos, omitidos o undefined sin coerción", () => {
  expect(propertySearchSchema.parse(emptyValues)).toStrictEqual(emptyValues);
  expect(propertySearchSchema.parse({})).toStrictEqual({});
  for (const key of Object.keys(emptyValues)) {
    expect(propertySearchSchema.safeParse({ [key]: undefined }).success).toBe(true);
  }
  expect(validate({ price: "" }).data.price).toBe("");
});

test("esquema admite todas las regiones y sus comunas administrativas sin restringir al demo", () => {
  for (const region of chileRegions) {
    expect(validate({ region: region.id }).success, region.name).toBe(true);
    for (const district of region.communes) {
      expect(validate({ region: region.id, district }).success, `${region.name}: ${district}`).toBe(true);
    }
  }
});

test("esquema utiliza los catálogos únicos de tipos y precios conservando strings", () => {
  for (const { value } of propertyTypes) {
    expect(validate({ type: value }).data.type).toBe(value);
  }
  for (const limit of PROPERTY_PRICE_LIMITS) {
    expect(validate({ price: String(limit) }).data.price).toBe(String(limit));
  }
});

test("esquema rechaza valores ajenos a los catálogos y tipos distintos de string", () => {
  const invalidValues = {
    region: ["99", "013", "Metropolitana", " ", 13, null, [], {}],
    district: [123, null, [], {}],
    type: ["castle", "APARTMENT", " ", 1, null, [], {}],
    price: ["0", "-1", "200000001", "2e8", "Infinity", "NaN", "200.000.000", " ", 200000000, null, [], {}],
  };
  for (const [field, values] of Object.entries(invalidValues)) {
    for (const value of values) {
      const result = validate({ [field]: value });
      expect(result.success, `${field}: ${JSON.stringify(value)}`).toBe(false);
      expect(result.error.issues.some((issue) => issue.path[0] === field)).toBe(true);
    }
  }
});

test("esquema rechaza comuna sin región, desconocida o de otra región con mensaje asociado", () => {
  for (const values of [
    { district: "Providencia" },
    { region: "4", district: "Providencia" },
    { region: "13", district: "La Serena" },
    { region: "13", district: "Atlantida" },
  ]) {
    const result = validate(values);
    expect(result.success).toBe(false);
    expect(result.error.issues.find((issue) => issue.path[0] === "district")?.message).toBe(
      values.region ? "La comuna debe pertenecer a la región seleccionada." : "Selecciona una región antes de elegir una comuna.");
  }
});

test("búsqueda vacía usa filters=all y no activa el preset de los resultados", () => {
  for (const values of [{}, emptyValues]) {
    const params = buildPropertySearchParams(propertySearchSchema.parse(values));
    expect(params.toString()).toBe("filters=all");
    expect(initializePropertySearch(params).toString()).toBe("filters=all");
  }
});

test("serializa filtros individuales y combinados sin claves vacías ni mutaciones", () => {
  const cases = [
    { region: "13" },
    { region: "13", district: "Ñuñoa" },
    { type: "house" },
    { price: "200000000" },
    { type: "apartment", price: "350000000" },
    { region: "13", type: "house" },
    { region: "13", district: "Ñuñoa", type: "apartment", price: "350000000" },
  ];
  for (const selection of cases) {
    const values = { ...emptyValues, ...selection };
    const original = { ...values };
    const params = buildPropertySearchParams(propertySearchSchema.parse(values));
    expect(Object.fromEntries(params)).toStrictEqual(selection);
    expect(initializePropertySearch(params).toString()).toBe(params.toString());
    expect(values).toStrictEqual(original);
  }
  expect(buildPropertySearchParams({ region: "13", district: "Ñuñoa" }).toString()).toMatch(/district=%C3%91u%C3%B1oa/);
});

test("la búsqueda combinada se interpreta sin cambiar el filtrado existente", () => {
  const catalogue = generateProperties(120);
  const values = propertySearchSchema.parse({ region: "13", district: "Ñuñoa", type: "apartment", price: "350000000" });
  const result = filterProperties(catalogue, buildPropertySearchParams(values));
  const expected = catalogue.filter((property) => property.region === 13 && property.district === "Ñuñoa" && property.type === "apartment" && property.price <= 350000000);
  expect(result).toStrictEqual(expected);
  expect(filterProperties(catalogue, buildPropertySearchParams(emptyValues)).length).toBe(catalogue.length);
});