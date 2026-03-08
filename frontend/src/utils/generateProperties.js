const cities = {
  Santiago: [
    "Ñuñoa",
    "Providencia",
    "Las Condes",
    "Vitacura",
    "La Reina",
    "Maipú",
    "Puente Alto",
    "Peñalolén",
    "San Miguel",
    "San Bernardo",
    "La Florida",
  ],
  Valparaíso: [
    "Valparaíso",
    "Viña del Mar",
    "Cerro Alegre",
    "Cerro Concepción",
  ],
  Concepción: ["Centro", "San Pedro de la Paz", "Talcahuano"],
  "La Serena": ["La Florida", "Coquimbo"],
  Talca: ["San Clemente", "Talca"],
};

const districtCoordinates = {
  Santiago: {
    Ñuñoa: [-33.4553, -70.6007],
    Providencia: [-33.4372, -70.6506],
    "Las Condes": [-33.4081, -70.5676],
    Vitacura: [-33.3904, -70.5467],
    "La Reina": [-33.4489, -70.5533],
    Maipú: [-33.5111, -70.7581],
    "Puente Alto": [-33.6117, -70.5756],
    Peñalolén: [-33.4858, -70.5514],
    "San Miguel": [-33.4925, -70.6517],
    "San Bernardo": [-33.5933, -70.6996],
    "La Florida": [-33.5226, -70.5933],
  },

  Valparaíso: {
    Valparaíso: [-33.0472, -71.6127],
    "Viña del Mar": [-33.0245, -71.5518],
    "Cerro Alegre": [-33.0417, -71.6266],
    "Cerro Concepción": [-33.0413, -71.6262],
  },

  Concepción: {
    Centro: [-36.8201, -73.0444],
    "San Pedro de la Paz": [-36.8466, -73.104],
    Talcahuano: [-36.7249, -73.1167],
  },

  "La Serena": {
    "La Florida": [-29.9045, -71.2519], // comuna homónima distinta
    Coquimbo: [-29.9533, -71.3436],
  },

  Talca: {
    "San Clemente": [-35.5367, -71.4875],
    Talca: [-35.4264, -71.6554],
  },
};

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

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomOffset = () => (Math.random() - 0.5) * 0.02;

export const generateProperties = (count = 120) => {
  const generated = [];

  for (let i = 0; i < count; i++) {
    const city = random(Object.keys(cities));
    const district = random(cities[city]);
    const type = random(types);

    const coords = districtCoordinates[city]?.[district] || [-33.45, -70.66];

    generated.push({
      id: i + 1,
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
      location: `${district}, ${city}`,

      region:
        city === "Santiago"
          ? "metropolitana"
          : city === "Valparaíso"
            ? "valparaiso"
            : city === "Concepción"
              ? "biobio"
              : city === "La Serena"
                ? "coquimbo"
                : "maule",

      price: Math.floor(Math.random() * 450000000) + 70000000,

      bedrooms:
        type === "land" || type === "office"
          ? 0
          : Math.floor(Math.random() * 4) + 1,

      bathrooms: type === "land" ? 0 : Math.floor(Math.random() * 3) + 1,

      area:
        type === "land"
          ? Math.floor(Math.random() * 1200) + 300
          : Math.floor(Math.random() * 180) + 40,

      lat: coords[0] + randomOffset(),
      lng: coords[1] + randomOffset(),

      description: "Propiedad en excelente ubicación y buena conectividad.",

      images: [imagesByType[type]],
    });
  }

  return generated;
};
