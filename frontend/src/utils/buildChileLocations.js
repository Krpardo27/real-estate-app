import { chileRegions } from "../data/regions";

export const buildChileLocations = () => {
  const locations = [];

  chileRegions.forEach((region) => {
    // Región
    locations.push({
      value: `region-${region.id}`,
      label: `Región de ${region.name}`,
      type: "region",
      regionId: region.id,
      regionName: region.name,
    });

    // Comunas
    region.communes.forEach((commune) => {
      locations.push({
        value: commune.toLowerCase().replace(/\s+/g, "-"),
        label: `${commune}, ${region.name}`,
        type: "commune",
        regionId: region.id,
        regionName: region.name,
        commune,
      });
    });
  });

  return locations;
};
