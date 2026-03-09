import { useState } from "react";
import { Link } from "react-router-dom";

import {
  FiHeart,
  FiUser,
  FiMap,
  FiHome,
  FiMenu,
  FiX,
  FiInstagram,
  FiFacebook
} from "react-icons/fi";

import { FaWhatsapp, FaTiktok } from "react-icons/fa";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full h-[80px] border-b border-zinc-200 bg-white shadow-sm">

        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-4">

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-zinc-100"
            >
              <FiMenu size={22} />
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="text-xl font-bold text-indigo-600 flex items-center gap-2"
            >
              <FiHome />
              HomeEstate
            </Link>

          </div>

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

          {/* RIGHT */}
          <div className="flex items-center gap-2">

            {/* Social (desktop only) */}
            <div className="hidden lg:flex items-center gap-1 mr-2">

              <a
                href="#"
                className="p-2 rounded-xl hover:bg-zinc-100"
              >
                <FiInstagram size={18} />
              </a>

              <a
                href="#"
                className="p-2 rounded-xl hover:bg-zinc-100"
              >
                <FiFacebook size={18} />
              </a>

              <a
                href="#"
                className="p-2 rounded-xl hover:bg-zinc-100"
              >
                <FaTiktok size={16} />
              </a>

            </div>

            {/* WhatsApp */}
            <a
              href="https://wa.me/56900000000"
              className="hidden md:flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium"
            >
              <FaWhatsapp />
              WhatsApp
            </a>

            {/* Favorites */}
            <button className="p-2 rounded-xl hover:bg-zinc-100">
              <FiHeart size={20} />
            </button>

            {/* User */}
            <button className="p-2 rounded-xl hover:bg-zinc-100">
              <FiUser size={20} />
            </button>

          </div>

        </div>
      </header>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">

          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />

          {/* panel */}
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-xl p-6">

            <div className="flex items-center justify-between mb-8">
              <h3 className="font-semibold text-lg">Menú</h3>

              <button onClick={() => setMobileOpen(false)}>
                <FiX size={22} />
              </button>
            </div>

            <nav className="flex flex-col gap-4 text-slate-700">

              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-100"
              >
                <FiHome />
                Inicio
              </Link>

              <Link
                to="/map"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-100"
              >
                <FiMap />
                Ver mapa
              </Link>

              <Link
                to="/favorites"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-100"
              >
                <FiHeart />
                Favoritos
              </Link>

            </nav>

            {/* Social */}
            <div className="flex gap-4 mt-10 text-slate-600">

              <FiInstagram size={20} />
              <FiFacebook size={20} />
              <FaTiktok size={18} />

            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/56900000000"
              className="mt-8 flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl"
            >
              <FaWhatsapp />
              Contactar por WhatsApp
            </a>

          </div>
        </div>
      )}
    </>
  );
};

export default Header;