import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiFilter, FiX } from "react-icons/fi";

import { properties } from "../data/properties";
import PropertiesMap from "../components/map/PropertiesMap";
import FiltersSidebar from "../components/FiltersSidebar";

const MapView = () => {

  const [searchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const region = searchParams.get("region")
    ? Number(searchParams.get("region"))
    : null;

  const district = searchParams.get("district");
  const city = searchParams.get("city");

  const price = searchParams.get("price")
    ? Number(searchParams.get("price"))
    : null;

  const bedrooms = searchParams.get("bedrooms")
    ? Number(searchParams.get("bedrooms"))
    : null;

  const bathrooms = searchParams.get("bathrooms")
    ? Number(searchParams.get("bathrooms"))
    : null;

  const area = searchParams.get("area")
    ? Number(searchParams.get("area"))
    : null;

  const filtered = properties.filter((p) => {

    if (region && p.region !== region) return false;
    if (city && p.city !== city) return false;
    if (district && p.district !== district) return false;

    if (price && p.price > price) return false;
    if (bedrooms && p.bedrooms < bedrooms) return false;
    if (bathrooms && p.bathrooms < bathrooms) return false;
    if (area && p.area < area) return false;

    return true;
  });

  return (
    <main className="w-full h-[calc(100vh-80px)] flex flex-col lg:flex-row">

      {/* BOTÓN MOBILE */}
      <div className="lg:hidden p-4 border-b">
        <button
          onClick={() => setFiltersOpen(true)}
          className="flex items-center gap-2 border rounded-xl px-4 py-2 text-sm bg-white"
        >
          <FiFilter />
          Filtros
        </button>
      </div>

      {/* SIDEBAR DESKTOP */}
      <div className="hidden lg:block w-[320px] p-4 overflow-y-auto border-r">
        <FiltersSidebar />
      </div>

      {/* MAP */}
      <div className="flex-1 p-4 relative z-0">
        <PropertiesMap properties={filtered} />
      </div>

      {/* DRAWER MOBILE */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[9999] lg:hidden">

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

export default MapView;