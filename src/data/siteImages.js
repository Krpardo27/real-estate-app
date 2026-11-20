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
    Santiago: "/images/cities/santiago-800.webp",
    Valparaíso: "/images/cities/valparaiso-800.webp",
    Concepción: "/images/cities/concepcion-800.webp",
    "La Serena": "/images/cities/la-serena-800.webp",
    Talca: "/images/cities/talca-800.webp",
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

export const cityImageSrcSets = {
  Santiago: "/images/cities/santiago-400.webp 400w, /images/cities/santiago-800.webp 800w",
  Valparaíso: "/images/cities/valparaiso-400.webp 400w, /images/cities/valparaiso-800.webp 800w",
  Concepción: "/images/cities/concepcion-400.webp 400w, /images/cities/concepcion-800.webp 800w",
  "La Serena": "/images/cities/la-serena-400.webp 400w, /images/cities/la-serena-800.webp 497w",
  Talca: "/images/cities/talca-400.webp 400w, /images/cities/talca-800.webp 800w",
};

// Originales de Wikimedia Commons conservados; derivados WebP bajo la misma licencia.
export const cityImageCredits = [
  { city: "Valparaíso", author: "Julia Sumangil", source: "https://commons.wikimedia.org/wiki/File:Historic_Quarter_of_the_Seaport_City_of_Valpara%C3%ADso_04.jpg", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/" },
  { city: "La Serena", author: "Krzysztof Ulaczyk; versión cuadrada de Juan Pablo Arancibia Medina", source: "https://commons.wikimedia.org/wiki/File:La_Serena_lighthouse_(square).jpg", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/" },
  { city: "Talca", author: "Nail (atribución de Commons)", source: "https://commons.wikimedia.org/wiki/File:Talca_plaza.JPG", license: "Dominio público" },
  { city: "Concepción", author: "Gherm", source: "https://commons.wikimedia.org/wiki/File:Arco_de_medicina_Udec.JPG", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/" },
  { city: "Santiago", author: "Miguel hernandez", source: "https://commons.wikimedia.org/wiki/File:Palacio_de_La_Moneda_-_miguelreflex.jpg", license: "CC BY-SA 2.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/" },
];

export function propertyImages(property, configuration = siteImages) {
  const override = configuration.properties?.[property.id];
  if (Array.isArray(override)) return [...new Set(override.filter((src) => typeof src === "string" && src.trim()).map((src) => src.trim()))];
  const typeImage = property.isDemo && configuration.propertyTypes?.[property.type];
  return typeImage ? [typeImage] : (property.images || []);
}