/** No convertir strings, null ni valores fuera de WGS84 a coordenadas. */
export const hasValidCoordinates = (property) => Boolean(property) &&
  Number.isFinite(property.lat) && Number.isFinite(property.lng) &&
  property.lat >= -90 && property.lat <= 90 &&
  property.lng >= -180 && property.lng <= 180;

export const getMappableProperties = (properties) =>
  Array.isArray(properties) ? properties.filter(hasValidCoordinates) : [];