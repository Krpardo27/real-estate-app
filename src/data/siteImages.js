// Configuración editorial única. Las rutas /images/... se sirven desde public/images/.
// Hasta recibir las fotografías definitivas se conservan las imágenes ilustrativas.
// No se prueban rutas locales inexistentes ni se inventan fotos de una propiedad.
export const siteImages = {
  hero: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  social: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  categories: {
    house: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    apartment: "https://images.unsplash.com/photo-1501183638710-841dd1904471",
    land: "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
    office: "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
  },
  cities: {
    Santiago: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    Valparaíso: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21",
    Concepción: "https://images.unsplash.com/photo-1505764706515-aa95265c5abc",
    "La Serena": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21",
    Talca: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
  },
  propertyTypes: {
    house: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    apartment: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4",
    land: "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
    office: "https://images.unsplash.com/photo-1497366216548-37526070297c",
  },
  // ID estable -> fotografías en orden. Ejemplo al recibir archivos reales:
  // 1: ["/images/properties/1/exterior.webp", "/images/properties/1/salon.webp"],
  properties: {},
};

export function propertyImages(property, configuration = siteImages) {
  const override = configuration.properties?.[property.id];
  if (Array.isArray(override)) return [...new Set(override.filter((src) => typeof src === "string" && src.trim()).map((src) => src.trim()))];
  const typeImage = property.isDemo && configuration.propertyTypes?.[property.type];
  return typeImage ? [typeImage] : (property.images || []);
}