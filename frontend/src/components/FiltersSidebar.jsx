import { useSearchParams } from "react-router-dom";
import { FiFilter, FiX } from "react-icons/fi";
import { chileRegions } from "../data/regions";
import Select from "react-select";

const FiltersSidebar = ({ className = "" }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const region = searchParams.get("region") || "";
  const districtParam = searchParams.get("district") || "";

  const selectedRegion = chileRegions.find((r) => r.id === region);
  const communes = selectedRegion?.communes ?? [];

  const communeOptions = communes.map((c) => ({
    value: c,
    label: c,
  }));

  const selectedCommune = communeOptions.find(
    (opt) => opt.value === districtParam,
  );

  const cityOptions = [
    { value: "Santiago", label: "Santiago" },
    { value: "Valparaíso", label: "Valparaíso" },
    { value: "Concepción", label: "Concepción" },
    { value: "La Serena", label: "La Serena" },
    { value: "Antofagasta", label: "Antofagasta" },
    { value: "Copiapó", label: "Copiapó" },
  ];

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);

    if (value) params.set(key, value);
    else params.delete(key);

    setSearchParams(params);
  };

  const priceOptions = [
    { value: "80000000", label: "Hasta 80M" },
    { value: "120000000", label: "Hasta 120M" },
    { value: "200000000", label: "Hasta 200M" },
  ];

  const bedroomOptions = [
    { value: "1", label: "1+" },
    { value: "2", label: "2+" },
    { value: "3", label: "3+" },
  ];

  const bathroomOptions = [
    { value: "1", label: "1+" },
    { value: "2", label: "2+" },
    { value: "3", label: "3+" },
  ];

  const areaOptions = [
    { value: "40", label: "40 m²" },
    { value: "60", label: "60 m²" },
    { value: "80", label: "80 m²" },
  ];

  const getSelected = (options, key) =>
    options.find((o) => o.value === (searchParams.get(key) || ""));

  const handleRegionChange = (value) => {
    const params = new URLSearchParams(searchParams);

    if (value) params.set("region", value);
    else params.delete("region");

    // cuando cambia región se limpia la comuna
    params.delete("district");

    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const activeFilters = Array.from(searchParams.entries());

  const formatFilterValue = (key, value) => {
    if (key === "region") {
      const region = chileRegions.find((r) => r.id === value);
      return region?.name || value;
    }

    return value;
  };

  return (
    <aside
      className={`bg-white border border-slate-200 rounded-2xl shadow-sm p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FiFilter className="text-indigo-600" />
          <h3 className="font-semibold text-slate-800">Filtros</h3>
        </div>

        {activeFilters.length > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs text-red-500 hover:text-red-600"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {activeFilters.map(([key, value]) => (
            <span
              key={key}
              className="flex items-center gap-1 bg-slate-100 text-xs p-2 rounded-full"
            >
              {formatFilterValue(key, value)}

              <button
                onClick={() => updateFilter(key, "")}
                className="hover:text-red-500"
              >
                <FiX size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Región */}
      <FilterBlock title="Región">
        <Select
          options={chileRegions.map((r) => ({
            value: r.id,
            label: r.name,
          }))}
          value={
            chileRegions
              .map((r) => ({ value: r.id, label: r.name }))
              .find((opt) => opt.value === region) || null
          }
          className="text-sm"
          styles={{
            control: (base) => ({
              ...base,
              borderRadius: "0.75rem",
              borderColor: "#e2e8f0",
              padding: "2px",
              boxShadow: "none",
            }),
          }}
          placeholder="Buscar región..."
          isClearable
          onChange={(option) => handleRegionChange(option ? option.value : "")}
        />
      </FilterBlock>

      {/* Ciudad */}
      <FilterBlock title="Ciudad">
        <Select
          options={cityOptions}
          value={cityOptions.find(
            (opt) => opt.value === searchParams.get("city"),
          )}
          className="text-sm text-slate-400"
          styles={{
            control: (base) => ({
              ...base,
              borderRadius: "0.75rem",
              borderColor: "#e2e8f0",
              padding: "2px",
              boxShadow: "none",
            }),
          }}
          placeholder="Buscar ciudad..."
          isClearable
          onChange={(option) =>
            updateFilter("city", option ? option.value : "")
          }
        />
      </FilterBlock>

      {/* Comuna */}
      <FilterBlock title="Comuna">
        <Select
          options={communeOptions}
          value={selectedCommune || null}
          isDisabled={!region}
          placeholder="Buscar comuna..."
          isClearable
          className="text-sm"
          styles={{
            control: (base) => ({
              ...base,
              borderRadius: "0.75rem",
              borderColor: "#e2e8f0",
              padding: "2px",
              boxShadow: "none",
            }),
          }}
          onChange={(option) =>
            updateFilter("district", option ? option.value : "")
          }
        />
      </FilterBlock>

      {/* Precio */}
      <FilterBlock title="Precio máximo">
        <Select
          options={priceOptions}
          value={getSelected(priceOptions, "price") || null}
          placeholder="Seleccionar precio..."
          isClearable
          className="text-sm"
          styles={{
            control: (base) => ({
              ...base,
              borderRadius: "0.75rem",
              borderColor: "#e2e8f0",
              padding: "2px",
              boxShadow: "none",
            }),
          }}
          onChange={(option) =>
            updateFilter("price", option ? option.value : "")
          }
        />
      </FilterBlock>

      {/* Dormitorios */}
      <FilterBlock title="Dormitorios">
        <Select
          options={bedroomOptions}
          value={getSelected(bedroomOptions, "bedrooms") || null}
          placeholder="Seleccionar dormitorios..."
          isClearable
          className="text-sm"
          styles={{
            control: (base) => ({
              ...base,
              borderRadius: "0.75rem",
              borderColor: "#e2e8f0",
              padding: "2px",
              boxShadow: "none",
            }),
          }}
          onChange={(option) =>
            updateFilter("bedrooms", option ? option.value : "")
          }
        />
      </FilterBlock>

      <FilterBlock title="Baños">
        <Select
          options={bathroomOptions}
          value={getSelected(bathroomOptions, "bathrooms") || null}
          placeholder="Seleccionar baños..."
          isClearable
          className="text-sm"
          styles={{
            control: (base) => ({
              ...base,
              borderRadius: "0.75rem",
              borderColor: "#e2e8f0",
              padding: "2px",
              boxShadow: "none",
            }),
          }}
          onChange={(option) =>
            updateFilter("bathrooms", option ? option.value : "")
          }
        />
      </FilterBlock>

      {/* Superficie */}
      <FilterBlock title="Superficie mínima">
        <Select
          options={areaOptions}
          value={getSelected(areaOptions, "area") || null}
          placeholder="Seleccionar superficie..."
          isClearable
          className="text-sm"
          styles={{
            control: (base) => ({
              ...base,
              borderRadius: "0.75rem",
              borderColor: "#e2e8f0",
              padding: "2px",
              boxShadow: "none",
            }),
          }}
          onChange={(option) =>
            updateFilter("area", option ? option.value : "")
          }
        />
      </FilterBlock>
    </aside>
  );
};

const FilterBlock = ({ title, children }) => (
  <div className="mb-5">
    <p className="text-sm font-medium text-slate-700 mb-2">{title}</p>
    {children}
  </div>
);

export default FiltersSidebar;
