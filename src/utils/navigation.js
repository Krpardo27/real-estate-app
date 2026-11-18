/** Lista y mapa comparten criterios, pero nunca el modo de vista del destino anterior. */
export const buildNavigationDestinations = ({ pathname, search = "" }) => {
  const isSearch = pathname === "/search";
  const isMap = pathname === "/map";
  const params = new URLSearchParams(isSearch || isMap ? search : "");
  const mapActive = isMap || (isSearch && params.get("view") === "map");
  params.delete("view");
  const query = params.size ? `?${params}` : "";

  return [
    { key: "home", to: "/", label: "Inicio", active: pathname === "/" },
    { key: "search", to: `/search${query}`, label: "Buscar", active: isSearch && !mapActive },
    { key: "map", to: `/map${query}`, label: "Mapa", active: mapActive },
    { key: "favorites", to: "/favorites", label: "Guardados", active: pathname === "/favorites" },
  ];
};