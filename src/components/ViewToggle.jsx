import { FiGrid, FiMap } from "react-icons/fi";

const ViewToggle = ({ view, setView }) => {
  return (
    <div role="group" aria-label="Vista de resultados" className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
      <button
        type="button"
        aria-pressed={view === "grid"}
        onClick={() => setView("grid")}
        className={`flex min-h-11 items-center gap-1 px-3 py-1.5 rounded-md text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2
        ${
          view === "grid"
            ? "bg-white shadow text-slate-800"
            : "text-slate-700 hover:text-slate-900"
        }`}
      >
        <FiGrid size={16} aria-hidden="true" />
        Lista
      </button>

      <button
        type="button"
        aria-pressed={view === "map"}
        onClick={() => setView("map")}
        className={`flex min-h-11 items-center gap-1 px-3 py-1.5 rounded-md text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2
        ${
          view === "map"
            ? "bg-white shadow text-slate-800"
            : "text-slate-700 hover:text-slate-900"
        }`}
      >
        <FiMap size={16} aria-hidden="true" />
        Mapa
      </button>
    </div>
  );
};

export default ViewToggle;
