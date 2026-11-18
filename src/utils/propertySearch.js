import { chileRegions } from "../data/regions.js";

/**
 * Conserva el contrato del hero: omitir vacíos y marcar la búsqueda sin filtros.
 * @param {import("../components/property-search/schemas/propertySearch.schema.js").PropertySearchValues} values
 */
export const buildPropertySearchParams = ({ region = "", district = "", type = "", price = "" }) => {
  const selectedRegion = chileRegions.find((entry) => entry.id === region);
  const params = new URLSearchParams();
  if (selectedRegion) params.set("region", selectedRegion.id);
  if (selectedRegion?.communes.includes(district)) params.set("district", district);
  if (type) params.set("type", type);
  if (price) params.set("price", price);
  if (!params.size) params.set("filters", "all");
  return params;
};