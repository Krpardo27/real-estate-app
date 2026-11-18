import { FiX } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import { FILTER_KEYS, parsePropertyFilters, updatePropertyFilter, formatFilterValue } from "../utils/propertyFilters.js";

const filterLabels = {
  region: "Región",
  city: "Ciudad",
  district: "Comuna",
  price: "Precio",
  bedrooms: "Dormitorios",
  bathrooms: "Baños",
  area: "Superficie",
  type: "Tipo",
};

const displayValue = (key, value) => key === "region"
  ? formatFilterValue(key, value).replace(/^Región\s+/i, "")
  : formatFilterValue(key, value);

const ActiveFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parsePropertyFilters(searchParams);

  const removeFilter = (key) => {
    setSearchParams((current) => updatePropertyFilter(current, key, ""));
  };

  const activeFilters = FILTER_KEYS.filter((key) => filters[key] !== undefined)
    .map((key) => [key, filters[key]]);

  if (!activeFilters.length) return null;

  return (
    <div role="group" aria-label="Filtros activos" className="flex flex-wrap gap-2">
      {activeFilters.map(([key, value]) => (
        <span
          key={key}
          className="flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 py-1 pl-3 pr-1 text-xs font-medium text-indigo-800"
        >
          {filterLabels[key]}: {displayValue(key, value)}

          <button
            type="button"
            aria-label={`Quitar filtro ${filterLabels[key]}: ${displayValue(key, value)}`}
            onClick={() => removeFilter(key)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-indigo-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <FiX size={14} aria-hidden="true" />
          </button>
        </span>
      ))}
    </div>
  );
};

export default ActiveFilters;