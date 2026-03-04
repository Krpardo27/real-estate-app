import { FiSearch } from "react-icons/fi";

const SearchBar = () => {
  return (
    <div className="hidden md:flex items-center border rounded-full px-4 py-2 gap-3 shadow-sm">
      <span className="text-sm">Dónde</span>

      <span className="text-gray-400">|</span>

      <span className="text-sm">Precio</span>

      <span className="text-gray-400">|</span>

      <span className="text-sm">Tipo</span>

      <button className="bg-black text-white p-2 rounded-full">
        <FiSearch size={16} />
      </button>
    </div>
  );
};

export default SearchBar;
