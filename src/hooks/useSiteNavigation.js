import { useLocation } from "react-router-dom";
import { FiHeart, FiHome, FiMap, FiSearch } from "react-icons/fi";
import { buildNavigationDestinations } from "../utils/navigation.js";
import { useFavorites } from "./useFavorites.js";

const icons = { home: FiHome, search: FiSearch, map: FiMap, favorites: FiHeart };

export const useSiteNavigation = () => {
  const location = useLocation();
  const { ids } = useFavorites();
  const savedCount = ids.length;

  return buildNavigationDestinations(location).map((destination) => ({
    ...destination,
    Icon: icons[destination.key],
    count: destination.key === "favorites" ? savedCount : 0,
    accessibleLabel: destination.key === "favorites" && savedCount
      ? `Guardados, ${savedCount} ${savedCount === 1 ? "propiedad" : "propiedades"}`
      : destination.label,
  }));
};