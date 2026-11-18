import { getMappableProperties } from "./coordinates.js";
import { normalizeText } from "../../utils/normalizeText.js";

/** Coordenadas originales, únicas y ordenadas: nunca centroides ni offsets. */
export function getLocationCoordinateKey(properties) {
  const coordinates = new Map();
  for (const { lng, lat } of getMappableProperties(properties)) {
    coordinates.set(JSON.stringify([lng, lat]), [lng, lat]);
  }
  return JSON.stringify([...coordinates.values()].sort((a, b) => a[0] - b[0] || a[1] - b[1]));
}

/** Firma de pertenencia, independiente del orden y del estado de la interfaz. */
export function getMapSelectionSignature(properties) {
  return JSON.stringify((Array.isArray(properties) ? properties : [])
    .map(({ id }) => JSON.stringify([typeof id, id])).sort());
}

/** Solo ciudades y comunas de los resultados actuales que se pueden cartografiar. */
export function buildMapLocations(properties) {
  const zones = new Map();
  for (const property of getMappableProperties(properties)) {
    const city = typeof property.city === "string" ? property.city.trim() : "";
    const district = typeof property.district === "string" ? property.district.trim() : "";
    const entries = city ? [{ name: city, label: city, type: "city", city: "" }] : [];
    if (district && normalizeText(district) !== normalizeText(city)) {
      entries.push({ name: district, label: city ? `${district}, ${city}` : district, type: "district", city });
    }
    for (const entry of entries) {
      const key = JSON.stringify([entry.type, normalizeText(entry.name), normalizeText(entry.city)]);
      if (!zones.has(key)) zones.set(key, { ...entry, key, properties: [] });
      zones.get(key).properties.push(property);
    }
  }
  return [...zones.values()].map((zone) => ({
    ...zone,
    coordinateKey: getLocationCoordinateKey(zone.properties),
  })).sort((a, b) => a.label.localeCompare(b.label, "es"));
}

/** Coincidencia exacta normalizada; un nombre ambiguo requiere elegir sugerencia. */
export function findMapLocation(locations, query) {
  const normalized = normalizeText(query).replace(/\s+/g, " ");
  if (!normalized) return null;
  const matches = locations.filter((zone) =>
    normalizeText(zone.label).replace(/\s+/g, " ") === normalized ||
    normalizeText(zone.name).replace(/\s+/g, " ") === normalized);
  return matches.length === 1 ? matches[0] : null;
}