import { properties } from "./properties";

const cityImages = {
  Santiago: "https://images.unsplash.com/photo-1547838642-4b6c9f3b1b07",
  Valparaíso: "https://images.unsplash.com/photo-1567696911980-2c6c9b0a2d4d",
  Concepción: "https://images.unsplash.com/photo-1505764706515-aa95265c5abc",
  "La Serena": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21",
  Talca: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
};

export const cities = Object.values(
  properties.reduce((acc, property) => {
    const city = property.city;

    if (!acc[city]) {
      acc[city] = {
        name: city,
        properties: 0,
        image: cityImages[city] || property.images?.[0] || "",
      };
    }

    acc[city].properties += 1;

    return acc;
  }, {})
).sort((a, b) => b.properties - a.properties);