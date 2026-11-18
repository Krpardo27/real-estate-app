import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { FiMapPin, FiSearch } from "react-icons/fi";
import { cld } from "../utils/cloudinary";
import { chileLocations } from "../data/locations";

const propertyTypes = [
  { value: "house", label: "Casa" },
  { value: "apartment", label: "Departamento" },
];

const regionOptions = chileLocations.filter((loc) => loc.type === "region");

const HeroSearch = () => {
  const navigate = useNavigate();

  const [location, setLocation] = useState(null);
  const [type, setType] = useState(null);

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (location?.type === "region") {
      params.set("region", location.regionId);
    }

    if (location?.type === "commune") {
      params.set("region", location.regionId);
      params.set("district", location.commune);
      params.set("city", "Santiago");
    }

    if (type) params.set("type", type.value);

    navigate(`/search?${params.toString()}`);
  };

  const loadLocations = (inputValue) => {
    if (!inputValue) {
      return Promise.resolve(regionOptions);
    }

    const search = inputValue.toLowerCase();

    const startsWith = [];
    const wordMatch = [];
    const contains = [];

    chileLocations.forEach((loc) => {
      const label = loc.label.toLowerCase();

      if (label.startsWith(search)) {
        startsWith.push(loc);
      } else if (label.split(" ").some((word) => word.startsWith(search))) {
        wordMatch.push(loc);
      } else if (label.includes(search)) {
        contains.push(loc);
      }
    });

    const results = [...startsWith, ...wordMatch, ...contains].slice(0, 10);

    return Promise.resolve(results);
  };

  return (
    <section className="relative min-h-[70vh] max-w-full not-even:flex items-center justify-center overflow-hidden ">
      <img
        src={cld(
          "real-estate/hero-house/photo-1560518883-ce09059eeffa_b4up0m",
          1920,
        )}
        alt="Casas en venta"
        fetchpriority="high"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative w-full max-w-4xl px-2 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Encuentra tu próximo hogar
        </h1>

        <p className="text-lg opacity-90 mb-10">
          Casas y departamentos en todo Chile
        </p>

        <div className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col md:flex-row gap-3">
          {/* ubicación */}
          <div className="relative flex-1">
            <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />

            <AsyncSelect
              cacheOptions
              defaultOptions={regionOptions}
              loadOptions={loadLocations}
              formatOptionLabel={(option) => (
                <div className="flex items-center gap-2">
                  {option.type === "region" && "🌎"}
                  {option.type === "commune" && "📍"}
                  <span>{option.label}</span>
                </div>
              )}
              value={location}
              onChange={(option) => setLocation(option)}
              placeholder="Buscar ciudad, comuna o región..."
              className="text-sm text-slate-600"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "0.75rem",
                  borderColor: "#e2e8f0",
                  paddingLeft: "30px",
                  minHeight: "46px",
                  boxShadow: "none",
                }),
              }}
              isClearable
            />
          </div>

          {/* tipo */}
          <div className="min-w-[180px]">
            <Select
              options={propertyTypes}
              value={type}
              className="text-sm text-slate-600"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "0.75rem",
                  borderColor: "#e2e8f0",
                  padding: "2px",
                  boxShadow: "none",
                }),
              }}
              placeholder="Tipo"
              isClearable
              onChange={(opt) => setType(opt)}
            />
          </div>

          {/* botón */}
          <button
            onClick={handleSearch}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition"
          >
            <FiSearch />
            Buscar
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
