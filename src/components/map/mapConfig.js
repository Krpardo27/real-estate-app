export const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";
export const MAP_STYLES = [
  { id: "positron", label: "Mapa claro", name: "Claro", url: MAP_STYLE },
  { id: "liberty", label: "Mapa de calles", name: "Calles", url: "https://tiles.openfreemap.org/styles/liberty" },
];
export const INITIAL_VIEW_STATE = { longitude: -70.66, latitude: -33.45, zoom: 10 };

export const MAP_LOCALE = {
  "Map.Title": "Mapa interactivo de propiedades",
  "NavigationControl.ZoomIn": "Acercar",
  "NavigationControl.ZoomOut": "Alejar",
  "NavigationControl.ResetBearing": "Orientar al norte",
};

/** La clave contiene únicamente coordenadas únicas y ordenadas, nunca identidades React. */
export function fitMapToCoordinates(map, coordinateKey, reducedMotion) {
  if (!map) return;
  const coordinates = JSON.parse(coordinateKey);
  const duration = reducedMotion ? 0 : 450;
  map.stop();

  if (!coordinates.length) {
    map.easeTo({
      center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
      zoom: INITIAL_VIEW_STATE.zoom,
      bearing: 0,
      pitch: 0,
      duration,
    });
    return;
  }

  if (coordinates.length === 1) {
    map.easeTo({ center: coordinates[0], zoom: 13, bearing: 0, pitch: 0, duration });
    return;
  }

  const longitudes = coordinates.map(([longitude]) => longitude);
  const latitudes = coordinates.map(([, latitude]) => latitude);
  const container = map.getContainer();
  // Evitar un padding mayor que el lienzo en columnas o pantallas estrechas.
  const padding = Math.max(0, Math.min(
    40,
    (container.clientWidth - 1) / 2,
    (container.clientHeight - 1) / 2,
  ));
  map.fitBounds([
    [Math.min(...longitudes), Math.min(...latitudes)],
    [Math.max(...longitudes), Math.max(...latitudes)],
  ], { padding, maxZoom: 13, duration, linear: true, bearing: 0, pitch: 0 });
}