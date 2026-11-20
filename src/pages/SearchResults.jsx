import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useNavigationType,
  useSearchParams,
} from "react-router-dom";
import { properties } from "../data/properties";
import FiltersSidebar from "../components/FiltersSidebar";
import FiltersDrawer from "../components/FiltersDrawer";
import PropertyCard from "../components/PropertyCard";
import ViewToggle from "../components/ViewToggle";
import MiniLoader from "../components/MiniLoader";
import ActiveFilters from "../components/ActiveFilter";
import Seo from "../components/Seo.jsx";
import {
  FILTER_KEYS,
  clearPropertyFilters,
  filterProperties,
  parsePropertyFilters,
} from "../utils/propertyFilters.js";
import { FiArrowRight, FiFilter, FiMapPin, FiSearch } from "react-icons/fi";

const PropertiesMap = lazy(() => import("../components/map/PropertiesMap"));
const PAGE_SIZE = 12;

const SearchResults = ({ mapOnly = false }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  useEffect(() => {
    if (navigationType === "POP") return;
    const state = location.state;
    if (!state?.focusResults && typeof state?.focusFilter !== "string") return;
    const target = FILTER_KEYS.includes(state?.focusFilter)
      ? document.querySelector(`[data-filter-key="${state.focusFilter}"]`)
      : null;
    (target || document.getElementById("search-results-title"))?.focus({
      preventScroll: true,
    });
  }, [location, navigationType]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const view = mapOnly || searchParams.get("view") === "map" ? "map" : "grid";
  // Abrir un diálogo no debe reconstruir el índice geográfico del mapa.
  const filtered = useMemo(
    () => filterProperties(properties, searchParams),
    [searchParams],
  );
  const filters = parsePropertyFilters(searchParams);
  const activeCount = FILTER_KEYS.filter(
    (key) => filters[key] !== undefined,
  ).length;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rawPage = searchParams.get("page") || "1";
  const requestedPage = /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
  const page = Number.isSafeInteger(requestedPage)
    ? Math.min(totalPages, Math.max(1, requestedPage))
    : 1;
  const start = (page - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);
  const sort = searchParams.get("sort");
  const sortValue = ["price-asc", "price-desc"].includes(sort) ? sort : "";
  const paramsForView = (nextView) => {
    const params = new URLSearchParams(searchParams);
    if (nextView === "map") params.set("view", "map");
    else params.delete("view");
    return params;
  };
  const handleViewChange = (nextView) => {
    const params = paramsForView(nextView);
    if (mapOnly && nextView === "grid")
      navigate({ pathname: "/search", search: `?${params}` });
    else setSearchParams(params, { preventScrollReset: true });
  };
  const changeSort = (event) => {
    const params = new URLSearchParams(searchParams);
    if (event.target.value) params.set("sort", event.target.value);
    else params.delete("sort");
    params.delete("page");
    setSearchParams(params, { preventScrollReset: true });
  };
  const clearFilters = () => {
    setSearchParams((current) => clearPropertyFilters(current), {
      preventScrollReset: true,
    });
  };
  const pageLink = (nextPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    return {
      pathname: "/search",
      search: `?${params}`,
      hash: "#search-results-title",
    };
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:py-8">
      <Seo
        title={mapOnly ? "Mapa de propiedades" : "Buscar propiedades"}
        description="Explora el catálogo inmobiliario de demostración por ubicación, precio y características."
        noindex
      />
      <header className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-700">
            {view === "map" ? (
              <FiMapPin size={16} aria-hidden="true" />
            ) : (
              <FiSearch size={16} aria-hidden="true" />
            )}{" "}
            Explora el catálogo
          </p>
          <h1
            id="search-results-title"
            tabIndex={-1}
            className="scroll-mt-28 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
          >
            {view === "map"
              ? "Propiedades en el mapa"
              : "Encuentra tu propiedad"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {view === "map"
              ? "Explora las zonas, cambia la vista y consulta cada ficha."
              : "Ajusta la ubicación y las características para comparar tus opciones."}
          </p>
        </div>
        <ViewToggle view={view} setView={handleViewChange} />
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6">
        <div className="sticky top-24 hidden max-h-[calc(100dvh-112px)] self-start overflow-y-auto overscroll-contain rounded-lg lg:block">
          <FiltersSidebar />
        </div>
        <section aria-labelledby="search-results-title" className="min-w-0">
          <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div role="status" aria-live="polite" aria-atomic="true">
                <p className="text-base font-semibold text-slate-900">
                  {filtered.length}{" "}
                  {filtered.length === 1
                    ? "propiedad encontrada"
                    : "propiedades encontradas"}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {view === "grid" && filtered.length > 0
                    ? `Mostrando ${start + 1}–${Math.min(start + PAGE_SIZE, filtered.length)} · Página ${page} de ${totalPages}`
                    : "Ubicaciones aproximadas · Catálogo de demostración"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  aria-label="Filtros"
                  aria-haspopup="dialog"
                  aria-expanded={filtersOpen}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-800 lg:hidden"
                >
                  <FiFilter aria-hidden="true" /> Filtros
                  {activeCount > 0 && (
                    <span
                      aria-hidden="true"
                      className="rounded bg-indigo-700 px-1.5 py-0.5 text-xs text-white"
                    >
                      {activeCount}
                    </span>
                  )}
                </button>
                <label htmlFor="property-sort" className="sr-only">
                  Ordenar por
                </label>
                <select
                  id="property-sort"
                  value={sortValue}
                  onChange={changeSort}
                  className="min-h-11 max-w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                >
                  <option value="">Orden del catálogo</option>
                  <option value="price-asc">Precio: menor a mayor</option>
                  <option value="price-desc">Precio: mayor a menor</option>
                </select>
              </div>
            </div>
            {activeCount > 0 ? (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <ActiveFilters />
              </div>
            ) : (
              <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-600">
                Sin filtros: estás explorando todo el catálogo.
              </p>
            )}
          </div>

          {view === "map" ? (
            <>
              {filtered.length === 0 && (
                <div className="mb-3 rounded-md border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-950">
                  <p>
                    No hay propiedades con esta combinación. El mapa sigue
                    disponible para explorar.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-1 inline-flex min-h-11 items-center gap-2 font-semibold underline underline-offset-4"
                  >
                    Ver todo el catálogo <FiArrowRight aria-hidden="true" />
                  </button>
                </div>
              )}
              <div className="relative isolate z-0 h-[76dvh] min-h-135 max-h-210 sm:min-h-155">
                <Suspense
                  fallback={
                    <MiniLoader label="Cargando mapa de propiedades…" />
                  }
                >
                  <PropertiesMap properties={filtered} />
                </Suspense>
              </div>
            </>
          ) : filtered.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 sm:p-10 text-center">
              <h2 className="font-semibold text-slate-900">
                No encontramos propiedades con estos filtros
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Prueba con una ubicación o un rango de precio diferente.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 min-h-11 rounded-md bg-slate-900 px-4 py-2 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {visible.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
              {totalPages > 1 && (
                <nav
                  aria-label="Paginación de propiedades"
                  className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm"
                >
                  {page > 1 ? (
                    <Link
                      to={pageLink(page - 1)}
                      state={{ focusResults: true }}
                      className="min-h-11 border rounded-md px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2"
                      rel="prev"
                    >
                      Anterior
                    </Link>
                  ) : (
                    <span />
                  )}
                  <span>
                    Página {page} de {totalPages}
                  </span>
                  {page < totalPages ? (
                    <Link
                      to={pageLink(page + 1)}
                      state={{ focusResults: true }}
                      className="min-h-11 border rounded-md px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2"
                      rel="next"
                    >
                      Siguiente
                    </Link>
                  ) : (
                    <span />
                  )}
                </nav>
              )}
            </>
          )}
        </section>
      </div>
      <FiltersDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)}>
        <FiltersSidebar onClose={() => setFiltersOpen(false)} />
      </FiltersDrawer>
    </div>
  );
};

export default SearchResults;
