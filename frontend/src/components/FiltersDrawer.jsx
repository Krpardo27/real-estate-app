// components/FiltersDrawer.jsx
import { FiX } from "react-icons/fi";
import FiltersSidebar from "./FiltersSidebar";

const FiltersDrawer = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* panel */}
      <div className="absolute right-0 top-0 h-full w-[90%] max-w-sm bg-white shadow-xl overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Filtros</h3>
          <button onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <FiltersSidebar />
      </div>
    </div>
  );
};

export default FiltersDrawer;
