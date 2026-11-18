import { chileRegions } from "../data/regions.js";
import { propertyTypes } from "../data/propertyTypes.js";
import { DEMO_LOCATIONS } from "./generateProperties.js";
import { normalizeText } from "./normalizeText.js";

// Solo filtros: sort y otros parámetros de navegación no generan chips.
export const FILTER_KEYS = Object.freeze([
  "region", "city", "district", "type", "price", "bedrooms", "bathrooms", "area",
]);

export const DEFAULT_PROPERTY_FILTERS = Object.freeze({ region: "13", type: "apartment", price: "350000000" });
export const DEFAULT_SEARCH_QUERY = new URLSearchParams(DEFAULT_PROPERTY_FILTERS).toString();
export const PROPERTY_PRICE_LIMITS = Object.freeze([80000000, 120000000, 200000000, 350000000, 520000000]);

/** Inicializa solo búsquedas sin criterios explícitos, incluso si estos son inválidos. */
export const initializePropertySearch = (searchParams) => {
  const params = new URLSearchParams(searchParams);
  if (params.get("filters") !== "all" && !FILTER_KEYS.some((key) => params.has(key))) {
    for (const [key, value] of Object.entries(DEFAULT_PROPERTY_FILTERS)) params.set(key, value);
  }
  return params;
};

/** Vaciar es una decisión explícita: el loader no debe reponer el preset. */
export const clearPropertyFilters = (searchParams) => {
  const params = new URLSearchParams(searchParams);
  FILTER_KEYS.forEach((key) => params.delete(key));
  params.delete("page");
  params.set("filters", "all");
  return params;
};

export const applyDefaultPropertyFilters = (searchParams) => {
  const params = clearPropertyFilters(searchParams);
  params.delete("filters");
  for (const [key, value] of Object.entries(DEFAULT_PROPERTY_FILTERS)) params.set(key, value);
  return params;
};

const TYPES = Object.fromEntries(propertyTypes.map(({ value, label }) => [value, label]));
const numericKeys = ["price", "bedrooms", "bathrooms", "area"];
const normalize = (value) => normalizeText(value).replace(/\s+/g, " ");
const communes = [...new Set(chileRegions.flatMap((region) => region.communes))];
const canonicalCommune = (value) => communes.find((name) => normalize(name) === normalize(value));
const parseNumber = (raw, integer = false) => {
  // No exponentes, Infinity, hexadecimales, negativos ni parseos parciales.
  const text = raw?.trim();
  if (!text || !/^\d+(?:\.\d+)?$/.test(text)) return undefined;
  const value = Number(text);
  if (!Number.isFinite(value) || value > Number.MAX_SAFE_INTEGER) return undefined;
  if (integer && !Number.isSafeInteger(value)) return undefined;
  return value;
};

/** Parámetros desconocidos o inválidos se ignoran; cero es un límite válido. */
export const parsePropertyFilters = (searchParams) => {
  const filters = {};
  const regionId = parseNumber(searchParams.get("region"), true);
  const region = chileRegions.find((entry) => Number(entry.id) === regionId);
  if (region) filters.region = region.id;
  const city = DEMO_LOCATIONS.find((entry) => normalize(entry.city) === normalize(searchParams.get("city")));
  if (city) filters.city = city.city;
  const district = searchParams.get("district");
  const canonicalDistrict = district && canonicalCommune(district);
  if (canonicalDistrict) filters.district = canonicalDistrict;
  const type = normalize(searchParams.get("type"));
  if (Object.hasOwn(TYPES, type)) filters.type = type;
  for (const key of numericKeys) {
    const value = parseNumber(searchParams.get(key), key === "bedrooms" || key === "bathrooms");
    if (value !== undefined) filters[key] = value;
  }
  const sort = searchParams.get("sort")?.trim();
  if (sort === "price-asc" || sort === "price-desc") filters.sort = sort;
  return filters;
};

/** No muta el catálogo ni los URLSearchParams. Precio máximo; demás mínimos. */
export const filterProperties = (properties, searchParams) => {
  const filters = parsePropertyFilters(searchParams);
  const result = properties.filter((property) => {
    if (!property) return false;
    if (filters.region && Number(property.region) !== Number(filters.region)) return false;
    for (const key of ["city", "district", "type"]) {
      if (filters[key] && normalize(property[key]) !== normalize(filters[key])) return false;
    }
    for (const key of numericKeys) {
      if (filters[key] === undefined) continue;
      const value = property[key];
      if (!Number.isFinite(value) || value < 0) return false;
      if (key === "price" ? value > filters[key] : value < filters[key]) return false;
    }
    return true;
  });
  if (filters.sort) {
    const direction = filters.sort === "price-asc" ? 1 : -1;
    result.sort((a, b) => {
      const aValid = Number.isFinite(a.price) && a.price >= 0;
      const bValid = Number.isFinite(b.price) && b.price >= 0;
      if (!aValid || !bValid) return Number(bValid) - Number(aValid);
      return direction * (a.price - b.price);
    });
  }
  return result;
};

/** Conserva sort y parámetros ajenos. La región nunca deja dependencias obsoletas. */
export const updatePropertyFilter = (searchParams, key, value) => {
  const params = new URLSearchParams(searchParams);
  if (!FILTER_KEYS.includes(key)) return params;
  params.delete("page");
  if (value !== "" && value !== null && value !== undefined) params.set(key, String(value));
  else params.delete(key);
  if (key === "region") {
    params.delete("district");
    const region = parsePropertyFilters(params).region;
    if (params.has("city")) {
      const city = DEMO_LOCATIONS.find((entry) => normalize(entry.city) === normalize(params.get("city")));
      // Quitar región no hace incompatible una ciudad; elegir otra sí.
      if (region && (!city || String(city.region) !== region)) params.delete("city");
    }
  }
  if (key === "city") {
    const city = DEMO_LOCATIONS.find((entry) => normalize(entry.city) === normalize(value));
    if (city) {
      if (params.has("district") && !city.districts.some((entry) => normalize(entry.name) === normalize(params.get("district")))) {
        params.delete("district");
      }
      const region = parsePropertyFilters(params).region;
      if (region && String(city.region) !== region) params.delete("region");
    }
  }
  if (FILTER_KEYS.some((filterKey) => params.has(filterKey))) params.delete("filters");
  else params.set("filters", "all");
  return params;
};

export const formatFilterValue = (key, value) => {
  if (key === "region") return chileRegions.find((region) => Number(region.id) === Number(value))?.name || String(value);
  if (key === "type") return TYPES[value] || String(value);
  if (key === "price") return `Hasta $${Number(value).toLocaleString("es-CL")} CLP`;
  if (key === "bedrooms") return `${value}+ dormitorios`;
  if (key === "bathrooms") return `${value}+ baños`;
  if (key === "area") return `Desde ${Number(value).toLocaleString("es-CL")} m²`;
  return String(value);
};