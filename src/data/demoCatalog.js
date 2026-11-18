// Catálogo DEMO: no son avisos, direcciones ni precios de mercado reales.
// Regiones y comunas administrativas contrastadas con data/regions.js.
// Santiago se usa como ciudad metropolitana; el resto, como ciudad homónima
// de su comuna. Barrios (Centro, Cerro Alegre, La Florida de La Serena, etc.)
// nunca se presentan como comunas. Coordenadas aproximadas de referencia:
// no se desplazan aleatoriamente, para no simular domicilios reales.
export const DEMO_LOCATIONS = [
  {
    city: "Santiago", region: 13,
    districts: [
      { name: "Ñuñoa", lat: -33.4553, lng: -70.6007 },
      { name: "Providencia", lat: -33.435, lng: -70.609 },
      { name: "Las Condes", lat: -33.4081, lng: -70.5676 },
      { name: "Vitacura", lat: -33.3904, lng: -70.5467 },
      { name: "La Reina", lat: -33.4489, lng: -70.5533 },
      { name: "Maipú", lat: -33.5111, lng: -70.7581 },
      { name: "Puente Alto", lat: -33.6117, lng: -70.5756 },
      { name: "Peñalolén", lat: -33.4858, lng: -70.5514 },
      { name: "San Miguel", lat: -33.4925, lng: -70.6517 },
      { name: "San Bernardo", lat: -33.5933, lng: -70.6996 },
      { name: "La Florida", lat: -33.5226, lng: -70.5933 },
    ],
  },
  { city: "Valparaíso", region: 5, districts: [{ name: "Valparaíso", lat: -33.0472, lng: -71.6127 }] },
  { city: "Concepción", region: 8, districts: [{ name: "Concepción", lat: -36.8201, lng: -73.0444 }] },
  { city: "La Serena", region: 4, districts: [{ name: "La Serena", lat: -29.9027, lng: -71.252 }] },
  { city: "Talca", region: 7, districts: [{ name: "Talca", lat: -35.4264, lng: -71.6554 }] },
];

export const DEMO_SEED = 20261116;

const types = ["apartment", "house", "office", "land"];

const imagesByType = {
  apartment:
    "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80",
  house:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  office:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
  land: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
};

// Mulberry32 local a cada llamada: mismo seed + count => mismo catálogo.
// Los IDs numéricos existentes se mantienen; ampliar count conserva el prefijo.
export const generateProperties = (count = 120, seed = DEMO_SEED) => {
  if (!Number.isSafeInteger(count) || count < 0 || count > 100000) {
    throw new RangeError("El tamaño del catálogo demo debe estar entre 0 y 100000.");
  }
  if (!Number.isSafeInteger(seed)) throw new TypeError("La semilla debe ser un entero seguro.");
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  const random = (items) => items[Math.floor(next() * items.length)];
  const generated = [];

  for (let i = 0; i < count; i++) {
    const { city, region, districts } = random(DEMO_LOCATIONS);
    const { name: district, lat, lng } = random(districts);
    const type = random(types);

    generated.push({
      id: i + 1,
      isDemo: true,
      type,

      title:
        type === "house"
          ? `Casa en ${district}`
          : type === "apartment"
            ? `Departamento en ${district}`
            : type === "office"
              ? `Oficina en ${district}`
              : `Terreno en ${district}`,

      city,
      district,
      location: district === city ? city : `${district}, ${city}`,

      region,

      price: Math.floor(next() * 450000000) + 70000000,

      bedrooms:
        type === "land" || type === "office"
          ? 0
          : Math.floor(next() * 4) + 1,

      bathrooms: type === "land" ? 0 : Math.floor(next() * 3) + 1,

      area:
        type === "land"
          ? Math.floor(next() * 1200) + 300
          : Math.floor(next() * 180) + 40,

      lat,
      lng,

      description: "Propiedad de demostración. Precio, características e imágenes ilustrativos; ubicación aproximada de la comuna, no una dirección real.",

      images: [imagesByType[type]],
    });
  }

  return generated;
};