import { properties } from "./properties.js";
import { siteImages } from "./siteImages.js";

export const cities = Object.values(
  properties.reduce((acc, property) => {
    const city = property.city;

    if (!acc[city]) {
      acc[city] = {
        name: city,
        region: property.region,
        isDemo: true,
        properties: 0,
        image: siteImages.cities[city] || property.images?.[0] || "",
      };
    }

    acc[city].properties += 1;

    return acc;
  }, {})
).sort((a, b) => b.properties - a.properties || a.name.localeCompare(b.name, "es"));