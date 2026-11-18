import { FiX } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import { chileRegions } from "../data/regions";

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

const ActiveFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const formatValue = (key, value) => {
    if (key === "region") {
      const region = chileRegions.find((r) => r.id === value);
      return region?.name || value;
    }

    if (key === "price") {
      return `Hasta ${Number(value).toLocaleString("es-CL")}`;
    }

    if (key === "bedrooms") return `${value}+ dorm`;
    if (key === "bathrooms") return `${value}+ baños`;
    if (key === "area") return `${value} m²`;

    return value;
  };

  const removeFilter = (key) => {
    const params = new URLSearchParams(searchParams);
    params.delete(key);
    setSearchParams(params);
  };

  const activeFilters = Array.from(searchParams.entries());

  if (!activeFilters.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {activeFilters.map(([key, value]) => (
        <span
          key={key}
          className="flex items-center gap-1 bg-slate-100 text-xs p-2 rounded-full"
        >
          {filterLabels[key]}: {formatValue(key, value)}

          <button
            onClick={() => removeFilter(key)}
            className="hover:text-red-500"
          >
            <FiX size={12} />
          </button>
        </span>
      ))}
    </div>
  );
};

export default ActiveFilters;