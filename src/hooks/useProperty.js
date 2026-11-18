import { getPropertyById } from "../data/properties.js";

export function useProperty(id) {
  // El catálogo es local e inmutable: no hay petición que cachear ni reintentar.
  const data = getPropertyById(id);
  return { data, isLoading: false, isError: !data };
}
