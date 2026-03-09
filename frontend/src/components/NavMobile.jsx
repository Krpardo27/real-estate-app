import { Link, useLocation } from "react-router-dom";

import {
  FiSearch,
  FiHeart,
  FiUser,
  FiHome,
  FiMap,
} from "react-icons/fi";

const NavMobile = () => {

  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path ? "text-indigo-600" : "text-zinc-600";

  return (
    <nav className="fixed bottom-0 left-0 w-full md:hidden bg-white border-t border-zinc-200 z-50">
      <div className="flex justify-around py-2 text-xs">

        <Link
          to="/"
          className={`flex flex-col items-center ${isActive("/")}`}
        >
          <FiHome size={20} />
          Inicio
        </Link>

        <Link
          to="/search"
          className={`flex flex-col items-center ${isActive("/search")}`}
        >
          <FiSearch size={20} />
          Buscar
        </Link>

        <Link
          to="/map"
          className={`flex flex-col items-center ${isActive("/map")}`}
        >
          <FiMap size={20} />
          Mapa
        </Link>

        <Link
          to="/favorites"
          className={`flex flex-col items-center ${isActive("/favorites")}`}
        >
          <FiHeart size={20} />
          Guardados
        </Link>

        <Link
          to="/profile"
          className={`flex flex-col items-center ${isActive("/profile")}`}
        >
          <FiUser size={20} />
          Perfil
        </Link>

      </div>
    </nav>
  );
};

export default NavMobile;