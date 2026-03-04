import { Link } from "react-router-dom";
import { FiSearch, FiHeart, FiUser } from "react-icons/fi";

const Header = () => {
  return (
    <header className="hidden md:block sticky top-0 z-50 bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold text-indigo-600 whitespace-nowrap"
        >
          HomeRadar
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xl flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-2 py-1">
          <input
            type="text"
            placeholder="Ciudad"
            className="w-32 px-2 py-2 text-sm bg-transparent outline-none"
          />

          <div className="w-px h-5 bg-zinc-200"></div>

          <select className="w-28 px-2 py-2 text-sm bg-transparent outline-none">
            <option>Tipo</option>
            <option>Casa</option>
            <option>Depto</option>
          </select>

          <div className="w-px h-5 bg-zinc-200"></div>

          <select className="w-32 px-2 py-2 text-sm bg-transparent outline-none">
            <option>Precio</option>
            <option>50M - 100M</option>
            <option>100M - 200M</option>
          </select>

          <div className="w-px h-5 bg-zinc-200"></div>

          <select className="w-24 px-2 py-2 text-sm bg-transparent outline-none">
            <option>Dorm.</option>
            <option>1+</option>
            <option>2+</option>
            <option>3+</option>
          </select>

          <button className="ml-1 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition">
            <FiSearch size={16} />
          </button>
        </div>

        {/* actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-zinc-100 transition">
            <FiHeart size={20} />
          </button>

          <button className="p-2 rounded-lg hover:bg-zinc-100 transition">
            <FiUser size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
