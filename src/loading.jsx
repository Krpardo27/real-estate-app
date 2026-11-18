import { FiHome } from "react-icons/fi";

const messages = {
  search: { title: "Buscando propiedades", description: "Preparando el catálogo y los filtros de búsqueda." },
  map: { title: "Preparando el mapa", description: "Cargando la vista de propiedades y sus controles." },
  property: { title: "Cargando la propiedad", description: "Preparando las imágenes y los detalles de la ficha." },
  favorites: { title: "Cargando tus guardados", description: "Preparando tu selección de propiedades." },
  default: { title: "Cargando página", description: "Enseguida podrás continuar explorando." },
};

const Loading = ({ pathname = "" }) => {
  const page = pathname.split("/")[1];
  const { title, description } = Object.hasOwn(messages, page) ? messages[page] : messages.default;
  const hasFilters = page === "search" || page === "map";

  return (
    <section role="status" aria-label="Cargando página" aria-live="polite" aria-atomic="true" className="page-container py-8 sm:py-12">
      <div className="max-w-lg">
        <div className="mb-5 flex items-center gap-3">
          <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-700"><FiHome size={21} /></span>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">HomeEstate</p>
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        <div aria-hidden="true" className="route-loading-progress mt-5 h-0.5 max-w-xs overflow-hidden rounded-full bg-slate-200">
          <span className="block h-full w-1/3 rounded-full bg-indigo-600" />
        </div>
      </div>

      <div aria-hidden="true" className={`mt-8 grid items-start gap-5 ${hasFilters ? "lg:grid-cols-[260px_minmax(0,1fr)]" : ""}`}>
        {hasFilters && (
          <div className="hidden rounded-lg border border-slate-200 bg-white p-5 lg:block">
            <div className="route-loading-block mb-6 h-4 w-24 rounded" />
            {[0, 1, 2, 3].map((field) => (
              <div key={field} className="mb-5 last:mb-0">
                <div className="route-loading-block mb-2 h-3 w-20 rounded" />
                <div className="h-11 rounded-md border border-slate-200 bg-slate-50" />
              </div>
            ))}
          </div>
        )}
        {page === "map" ? (
          <div className="relative min-h-80 rounded-lg border border-slate-200 bg-slate-100 sm:min-h-96">
            <div className="absolute right-4 top-4 h-28 w-11 rounded-md border border-slate-200 bg-white" />
            <div className="route-loading-block absolute inset-x-6 bottom-6 h-12 rounded-md" />
          </div>
        ) : page === "property" ? (
          <div className="grid gap-5 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div className="route-loading-block min-h-64 rounded-lg sm:min-h-80" />
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="route-loading-block mb-5 h-6 w-2/3 rounded" />
              <div className="route-loading-block mb-3 h-4 w-full rounded" />
              <div className="route-loading-block mb-8 h-4 w-4/5 rounded" />
              <div className="route-loading-block h-12 rounded-md" />
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((card) => (
              <div key={card} className={`overflow-hidden rounded-lg border border-slate-200 bg-white ${card > 0 ? "hidden sm:block" : ""} ${card === 2 ? "sm:hidden xl:block" : ""}`}>
                <div className="route-loading-block aspect-16/10" />
                <div className="space-y-3 p-4">
                  <div className="route-loading-block h-4 w-3/4 rounded" />
                  <div className="route-loading-block h-3 w-1/2 rounded" />
                  <div className="route-loading-block h-5 w-2/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Loading;