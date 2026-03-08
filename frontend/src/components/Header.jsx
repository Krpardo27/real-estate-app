import { Link } from "react-router-dom";
import { FiHeart, FiUser } from "react-icons/fi";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full h-[80px] border-b border-zinc-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold text-indigo-600"
        >
          Home Estate
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl hover:bg-zinc-100 transition-colors">
            <FiHeart size={20} />
          </button>

          <button className="p-2 rounded-xl hover:bg-zinc-100 transition-colors">
            <FiUser size={20} />
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;