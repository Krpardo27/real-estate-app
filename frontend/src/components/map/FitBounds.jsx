import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

const FitBounds = ({ properties }) => {
  const map = useMap();

  useEffect(() => {
    if (!properties?.length) return;

    const validCoords = properties
      .filter((p) => typeof p.lat === "number" && typeof p.lng === "number")
      .map((p) => [p.lat, p.lng]);

    if (validCoords.length === 1) {
      map.flyTo(validCoords[0], 13);
      return;
    }

    const bounds = L.latLngBounds(validCoords);

    map.fitBounds(bounds, {
      padding: [60, 60],
      maxZoom: 13,
    });

  }, [properties, map]);

  return null;
};

export default FitBounds;