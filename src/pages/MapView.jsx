import SearchResults from "./SearchResults.jsx";

const MapView = () => {
  // Una única implementación mantiene filtros, orden y conteos idénticos.
  return <SearchResults mapOnly />;
};

export default MapView;