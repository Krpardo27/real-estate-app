import { Link } from "react-router-dom";
import { FiArrowUpRight, FiHome } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { CONTACT_PHONE } from "../utils/contact";
import { useSiteNavigation } from "../hooks/useSiteNavigation.js";

const Header = () => {
  const destinations = useSiteNavigation();

  return (
    <header className="sticky top-0 z-50 h-20 w-full border-b border-slate-200 bg-white">
      <div className="page-container flex h-full items-center justify-between gap-3 lg:gap-6">
        <Link
          to="/"
          aria-label="HomeEstate, inicio"
          className="flex min-h-11 shrink-0 items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-700 text-white"><FiHome size={21} aria-hidden="true" /></span>
          <span>
            <span className="block text-lg font-bold tracking-tight text-slate-900 lg:text-xl">HomeEstate</span>
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
              className={`flex min-h-11 h-full items-center gap-2 border-b-2 px-2 text-sm font-semibold transition-colors focus-visible:rounded-sm focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-indigo-600 lg:px-3 ${active ? "border-indigo-700 text-indigo-700" : "border-transparent text-slate-600 hover:border-slate-200 hover:text-slate-950"}`}
            >
              <Icon size={18} aria-hidden="true" className="hidden lg:block" />
              {label}
              {count > 0 && <span aria-hidden="true" className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-md bg-slate-100 px-1 text-[10px] tabular-nums text-slate-700">{count > 99 ? "99+" : count}</span>}
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