import { FiGrid, FiMap } from "react-icons/fi";

const ViewToggle = ({ view, setView }) => {
  return (
    <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
      <button
        onClick={() => setView("grid")}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition
        ${
          view === "grid"
            ? "bg-white shadow text-slate-800"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <FiGrid size={16} />
        Grid
      </button>

      <button
        onClick={() => setView("map")}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition
        ${
          view === "map"
            ? "bg-white shadow text-slate-800"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <FiMap size={16} />
        Map
      </button>
    </div>
  );
};

export default ViewToggle;
