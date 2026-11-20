import { useId } from "react";
import { useSearchParams } from "react-router-dom";
import { FiFilter } from "react-icons/fi";
import { chileRegions } from "../data/regions.js";
import { propertyTypes } from "../data/propertyTypes.js";
import { DEMO_LOCATIONS } from "../utils/generateProperties.js";
import {
  FILTER_KEYS,
  PROPERTY_PRICE_LIMITS,
  parsePropertyFilters,
  updatePropertyFilter,
  formatFilterValue,
  clearPropertyFilters,
  applyDefaultPropertyFilters,
} from "../utils/propertyFilters.js";

const option = (value, label = value) => ({ value: String(value), label });
const fields = [
  {
    key: "type",
    label: "Tipo de propiedad",
    options: propertyTypes.map(({ value, label }) => option(value, label)),
  },
  {
    key: "price",
    label: "Precio máximo (CLP)",
    options: PROPERTY_PRICE_LIMITS.map((value) =>
      option(value, formatFilterValue("price", value)),
    ),
  },
  {
    key: "bedrooms",
    label: "Dormitorios mínimos",
    options: [1, 2, 3, 4].map((value) => option(value, `${value}+`)),
  },
  {
    key: "bathrooms",
    label: "Baños mínimos",
    options: [1, 2, 3].map((value) => option(value, `${value}+`)),
  },
  {
    key: "area",
    label: "Superficie mínima",
    options: [40, 60, 80, 120, 300].map((value) =>
      option(value, `${value} m²`),
    ),
  },
];

const FiltersSidebar = ({ className = "", onClose }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const id = useId();
  const filters = parsePropertyFilters(searchParams);
  const region = chileRegions.find((entry) => entry.id === filters.region);
  const selectedCity = DEMO_LOCATIONS.find(
    (entry) => entry.city === filters.city,
  );
  const communes = selectedCity
    ? selectedCity.districts.map((district) => district.name)
    : (region?.communes ?? [
        ...new Set(chileRegions.flatMap((entry) => entry.communes)),
      ]);
  const cityOptions = DEMO_LOCATIONS.filter(
    (city) => !filters.region || String(city.region) === filters.region,
  ).map((city) => option(city.city));
  const activeCount = FILTER_KEYS.filter(
    (key) => filters[key] !== undefined,
  ).length;
  const updateFilter = (key, value) => {
    setSearchParams((current) => updatePropertyFilter(current, key, value), {
      preventScrollReset: true,
    });
  };
  const clearFilters = () => {
    setSearchParams((current) => clearPropertyFilters(current), {
      preventScrollReset: true,
    });
  };
  const locationFields = [
    {
      key: "region",
      label: "Región",
      options: chileRegions.map((entry) =>
        option(entry.id, entry.name.replace(/^Región\s+/i, "")),
      ),
    },
    { key: "city", label: "Ciudad", options: cityOptions },
    {
      key: "district",
      label: "Comuna",
      options: communes.map((name) => option(name)),
    },
  ];
  const groups = [
    { label: "Ubicación", fields: locationFields },
    {
      label: "Presupuesto",
      fields: fields.filter((field) => field.key === "price"),
    },
    {
      label: "Características",
      fields: fields.filter((field) => field.key !== "price"),
    },
  ];

  return (
    <aside
      aria-labelledby={`${id}-title`}
      className={`rounded-lg border border-slate-200 bg-white p-4 sm:p-5 ${className}`}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-slate-100 pb-3">
        <h2
          id={`${id}-title`}
          className="flex items-center gap-2 text-base font-semibold text-slate-900"
        >
          <FiFilter aria-hidden="true" className="text-indigo-700" /> Filtros
          <span
            aria-label={`${activeCount} filtros activos`}
            className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-md bg-indigo-50 px-1.5 text-xs text-indigo-800"
          >
            {activeCount}
          </span>
        </h2>
        {FILTER_KEYS.some((key) => searchParams.has(key)) && (
          <button
            type="button"
            aria-label="Limpiar filtros"
            onClick={clearFilters}
            className="min-h-11 rounded-md px-2 text-sm font-medium text-indigo-700 underline underline-offset-4 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Limpiar
          </button>
        )}
      </div>
      {groups.map((group) => (
        <fieldset
          key={group.label}
          className="mb-5 min-w-0 space-y-3 border-0 p-0"
        >
          <legend className="mb-3 text-sm font-semibold text-slate-900">
            {group.label}
          </legend>
          {group.fields.map(({ key, label, options }) => {
            const value = String(filters[key] ?? "");
            const disabled =
              (key === "bedrooms" &&
                ["land", "office"].includes(filters.type)) ||
              (key === "bathrooms" && filters.type === "land");
            // Un límite válido escrito en la URL sigue siendo visible y editable.
            const visibleOptions =
              value && !options.some((entry) => entry.value === value)
                ? [...options, option(value, formatFilterValue(key, value))]
                : options;
            return (
              <div key={key}>
                <label
                  htmlFor={`${id}-${key}`}
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  {label}
                </label>
                <select
                  id={`${id}-${key}`}
                  name={key}
                  value={value}
                  disabled={disabled}
                  aria-describedby={disabled ? `${id}-${key}-hint` : undefined}
                  onChange={(event) => updateFilter(key, event.target.value)}
                  className={`min-h-11 w-full rounded-md border px-3 py-2 text-sm text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500 ${value ? "border-indigo-400 bg-indigo-50/40" : "border-slate-300 bg-white"}`}
                >
                  <option value="">Sin preferencia</option>
                  {visibleOptions.map((entry) => (
                    <option key={entry.value} value={entry.value}>
                      {entry.label}
                    </option>
                  ))}
                </select>
                {disabled && (
                  <p
                    id={`${id}-${key}-hint`}
                    className="mt-1 text-xs leading-5 text-slate-500"
                  >
                    No corresponde a este tipo de propiedad.
                  </p>
                )}
              </div>
            );
          })}
        </fieldset>
      ))}
      <button
        type="button"
        onClick={() =>
          setSearchParams((current) => applyDefaultPropertyFilters(current), {
            preventScrollReset: true,
          })
        }
        className="mb-3 min-h-11 w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-800 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Restablecer selección inicial
      </button>
      <p className="text-xs leading-relaxed text-slate-500">
        Catálogo de demostración. Datos e imágenes ilustrativos.
      </p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="mt-4 min-h-11 w-full rounded-md bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Ver resultados
        </button>
      )}
    </aside>
  );
};

export default FiltersSidebar;
