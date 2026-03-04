import { FiSearch, FiHeart, FiUser, FiHome } from "react-icons/fi";

const NavMobile = () => {
  return (
    <nav className="fixed bottom-0 left-0 w-full md:hidden bg-white border-t border-zinc-200 z-50">
      <div className="flex justify-around py-2 text-zinc-600">
        <button className="flex flex-col items-center text-xs">
          <FiHome size={20} />
          Inicio
        </button>

        <button className="flex flex-col items-center text-xs">
          <FiSearch size={20} />
          Buscar
        </button>

        <button className="flex flex-col items-center text-xs">
          <FiHeart size={20} />
          Guardados
        </button>

        <button className="flex flex-col items-center text-xs">
          <FiUser size={20} />
          Perfil
        </button>
      </div>
    </nav>
  );
};

export default NavMobile;
