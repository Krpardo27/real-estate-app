import { useEffect } from "react";
import { useMap } from "react-map-gl/maplibre";
import { fitMapToCoordinates } from "./mapConfig.js";

const FitBounds = ({ coordinateKey, loaded, reducedMotion }) => {
  const { current: map } = useMap();

  useEffect(() => {
    if (loaded) fitMapToCoordinates(map, coordinateKey, reducedMotion);
  }, [coordinateKey, loaded, map, reducedMotion]);

  return null;
};

export default FitBounds;