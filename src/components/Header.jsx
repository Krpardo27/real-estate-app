import { Link } from "react-router-dom";
import { FiArrowUpRight, FiHome } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { CONTACT_PHONE } from "../utils/contact";
import { useSiteNavigation } from "../hooks/useSiteNavigation.js";

const Header = () => {
  const destinations = useSiteNavigation();

  return (
    <header className="sticky top-0 z-50 h-20 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:gap-6">
        <Link
          to="/"
          aria-label="HomeEstate, propiedades en Chile, inicio"
          className="flex min-h-11 shrink-0 items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-700 text-white"><FiHome size={21} aria-hidden="true" /></span>
          <span>
            <span className="block text-lg font-bold tracking-tight text-slate-900 lg:text-xl">HomeEstate</span>{" "}
            <span className="mt-0.5 hidden text-[10px] font-medium tracking-wide text-slate-500 lg:block">Propiedades en Chile</span>
          </span>
        </Link>

        <nav aria-label="Navegación principal" className="hidden h-full items-center gap-1 md:flex lg:gap-3">
          {destinations.map(({ to, label, Icon, active, count, accessibleLabel }) => (
            <Link
              key={label}
              to={to}
              aria-label={accessibleLabel}
              aria-current={active ? "page" : undefined}
              className={`group flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 lg:px-3 ${active ? "text-indigo-700 hover:bg-indigo-50 hover:text-indigo-900" : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-800"}`}
            >
              <Icon size={18} aria-hidden="true" className="hidden lg:block" />
              <span className={`relative after:absolute after:inset-x-0 after:-bottom-1.5 after:h-0.5 after:rounded-full after:transition-colors ${active ? "after:bg-indigo-700 group-hover:after:bg-indigo-900" : "after:bg-transparent group-hover:after:bg-indigo-400"}`}>{label}</span>
              {" "}{count > 0 && <span aria-hidden="true" className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-indigo-700 px-1.5 text-xs font-bold leading-none tabular-nums text-white group-hover:bg-indigo-900">{count > 99 ? "99+" : count}</span>}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {CONTACT_PHONE && (
            <a
              href={`https://wa.me/${CONTACT_PHONE.slice(1)}`}
              className="hidden min-h-11 items-center gap-2 rounded-md px-2 text-sm font-medium text-slate-600 hover:text-indigo-700 xl:inline-flex"
            >
              <FaWhatsapp size={18} aria-hidden="true" />
              WhatsApp
            </a>
          )}
          <Link to="/search?filters=all" className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-slate-300 px-2.5 text-xs font-semibold text-slate-800 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:px-3 md:text-sm">
            Ver catálogo <FiArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;