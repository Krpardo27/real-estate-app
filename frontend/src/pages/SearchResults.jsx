import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { properties } from "../data/properties";

import FiltersSidebar from "../components/FiltersSidebar";
import PropertyCard from "../components/PropertyCard";
import ViewToggle from "../components/ViewToggle";
import MiniLoader from "../components/MiniLoader";
import ActiveFilters from "../components/ActiveFilter";

import { normalizeText } from "../utils/normalizeText";
import PropertiesMap from "../components/map/PropertiesMap";

import { FiFilter, FiX } from "react-icons/fi";

const SearchResults = () => {
  const [searchParams] = useSearchParams();

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [view, setView] = useState("grid");
  const [loadingView, setLoadingView] = useState(false);

  const handleViewChange = (newView) => {
    setLoadingView(true);

    setTimeout(() => {
      setView(newView);
      setLoadingView(false);
    }, 250);
  };

  // params
  const regionId = Number(searchParams.get("region"));
  const price = Number(searchParams.get("price"));
  const bedrooms = Number(searchParams.get("bedrooms"));
  const bathrooms = Number(searchParams.get("bathrooms"));
  const area = Number(searchParams.get("area"));

  const district = searchParams.get("district");
  const city = searchParams.get("city");
  const type = searchParams.get("type");

  const filtered = properties.filter((p) => {
    if (type && normalizeText(p.type) !== normalizeText(type)) return false;

    if (regionId && p.region !== Number(regionId)) return false;

    if (city && normalizeText(p.city) !== normalizeText(city)) return false;

    if (district && normalizeText(p.district) !== normalizeText(district))
      return false;

    if (price && p.price > Number(price)) return false;

    if (bedrooms && p.bedrooms < Number(bedrooms)) return false;

    if (bathrooms && p.bathrooms < Number(bathrooms)) return false;

    if (area && p.area < Number(area)) return false;

    return true;
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      {/* BOTÓN MOBILE */}
      <div className="lg:hidden mb-4 mx-4 flex items-center gap-2">
        <button
          onClick={() => setFiltersOpen(true)}
          className="flex items-center gap-2 border rounded-xl px-4 py-2 text-sm bg-white"
        >
          <FiFilter />
          Filtros
        </button>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-10">
        {/* SIDEBAR DESKTOP */}
        <div className="hidden lg:block sticky top-20 h-fit">
          <FiltersSidebar />
        </div>

        {/* RESULTADOS */}
        <section>
          <div className="flex flex-col gap-4 mb-6">
            {/* header */}
            <div className="flex flex-col lg:flex-row lg:items-center w-full lg:justify-between gap-3">
              <h1 className="text-lg sm:text-xl font-semibold text-slate-800">
                {filtered.length} propiedades encontradas
              </h1>

              <div className="flex items-center w-full justify-between lg:justify-end gap-3">
                <select className="border rounded-lg px-3 py-2 text-sm">
                  <option>Ordenar por</option>
                  <option>Precio menor</option>
                  <option>Precio mayor</option>
                  <option>Más recientes</option>
                </select>

                <ViewToggle view={view} setView={handleViewChange} />
              </div>
            </div>

            <ActiveFilters searchParams={searchParams} />
          </div>

          {loadingView ? (
            <MiniLoader />
          ) : filtered.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-10 text-center">
              <p className="text-slate-500">
                No encontramos propiedades con estos filtros
              </p>
            </div>
          ) : view === "grid" ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="h-[650px] relative z-30">
              <PropertiesMap key="map-view" properties={filtered} />
            </div>
          )}
        </section>
      </div>

      {/* DRAWER MOBILE */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setFiltersOpen(false)}
          />

          {/* panel */}
          <div className="absolute right-0 top-0 h-full w-[90%] max-w-sm bg-white shadow-xl overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Filtros</h3>

              <button onClick={() => setFiltersOpen(false)}>
                <FiX size={20} />
              </button>
            </div>

            <FiltersSidebar />
          </div>
        </div>
      )}
    </main>
  );
};

export default SearchResults;
