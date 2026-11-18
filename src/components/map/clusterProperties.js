import Supercluster from "supercluster";
import { getMappableProperties } from "./coordinates.js";

/** Índice geográfico reutilizable: no altera las propiedades ni desplaza sus coordenadas. */
export function createPropertyClusterIndex(properties) {
  const mappable = getMappableProperties(properties);
  const locations = new Map();
  mappable.forEach((property, propertyIndex) => {
    const key = JSON.stringify([property.lng, property.lat]);
    if (!locations.has(key)) {
      locations.set(key, {
        type: "Feature",
        geometry: { type: "Point", coordinates: [property.lng, property.lat] },
        properties: { key, propertyIndexes: [] },
      });
    }
    // Coincidencias exactas siguen juntas incluso por encima de maxZoom.
    locations.get(key).properties.propertyIndexes.push(propertyIndex);
  });
  const points = [...locations.values()].sort((a, b) =>
    a.geometry.coordinates[0] - b.geometry.coordinates[0] ||
    a.geometry.coordinates[1] - b.geometry.coordinates[1]);
  return {
    index: new Supercluster({ radius: 88, maxZoom: 18 }).load(points),
    properties: mappable,
    // FitBounds depende de ubicaciones únicas, no del zoom ni de los centroides.
    coordinateKey: JSON.stringify(points.map((point) => point.geometry.coordinates)),
  };
}

/** getLeaves devuelve índices del catálogo, nunca coordenadas inferidas de un centroide. */
export function getPropertyClusters({ index, properties }, zoom) {
  const level = Number.isFinite(zoom) ? Math.max(0, Math.min(19, Math.floor(zoom))) : 0;
  return index.getClusters([-180, -90, 180, 90], level).map((feature) => {
    const clustered = feature.properties.cluster;
    const leaves = clustered ? index.getLeaves(feature.properties.cluster_id, Infinity) : [feature];
    // Supercluster normaliza longitudes; para una ubicación conservar el dato
    // original exacto, no su conversión de ida/vuelta en coma flotante.
    const [longitude, latitude] = clustered ? feature.geometry.coordinates : JSON.parse(feature.properties.key);
    return {
      key: clustered ? `cluster:${feature.properties.cluster_id}` : feature.properties.key,
      longitude,
      latitude,
      properties: leaves.flatMap((leaf) =>
        leaf.properties.propertyIndexes.map((propertyIndex) => properties[propertyIndex])),
    };
  });
}