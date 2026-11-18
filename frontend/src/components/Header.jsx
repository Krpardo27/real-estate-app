import { Link } from "react-router-dom";

import {
  FiHeart,
  FiUser,
  FiMap,
  FiHome,
  FiInstagram,
  FiFacebook
} from "react-icons/fi";

import { FaWhatsapp, FaTiktok } from "react-icons/fa";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full h-[80px] border-b border-zinc-200 bg-white shadow-sm">

      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold text-indigo-600 flex items-center gap-2"
        >
          <FiHome />
          HomeEstate
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">

          <Link
            to="/map"
            className="flex items-center gap-2 hover:text-indigo-600 transition"
          >
            <FiMap />
            Ver mapa
          </Link>

        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">

          {/* Social desktop */}
          <div className="hidden lg:flex items-center gap-1 mr-2">

            <a href="#" className="p-2 rounded-xl hover:bg-zinc-100">
              <FiInstagram size={18} />
            </a>

            <a href="#" className="p-2 rounded-xl hover:bg-zinc-100">
              <FiFacebook size={18} />
            </a>

            <a href="#" className="p-2 rounded-xl hover:bg-zinc-100">
              <FaTiktok size={16} />
            </a>

          </div>

          {/* WhatsApp */}
          <a
            href="https://wa.me/56900000000"
            className="hidden sm:flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            <FaWhatsapp />
            WhatsApp
          </a>

          {/* Favorites */}
          <button className="p-2 rounded-xl hover:bg-zinc-100 transition">
            <FiHeart size={20} />
          </button>

          {/* User */}
          <button className="p-2 rounded-xl hover:bg-zinc-100 transition">
            <FiUser size={20} />
          </button>

        </div>

      </div>
    </header>
  );
};

export default Header;