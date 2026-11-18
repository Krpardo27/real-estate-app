import { Link } from "react-router-dom";
import { useSiteNavigation } from "../hooks/useSiteNavigation.js";

const NavMobile = () => {
  const destinations = useSiteNavigation();

  return (
    <nav
      aria-label="Navegación móvil"
      className="mobile-dock fixed left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-1.5 md:hidden"
    >
      <div className="grid h-full grid-cols-4 gap-1">
        {destinations.map(({ to, label, Icon, active, count, accessibleLabel }) => (
          <Link
            key={label}
            to={to}
            aria-label={accessibleLabel}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 ${active ? "bg-indigo-50 text-indigo-800" : "text-slate-600 hover:bg-slate-50 hover:text-indigo-700"}`}
          >
            <span className="relative">
              <Icon size={21} aria-hidden="true" />
              {count > 0 && <span aria-hidden="true" className="absolute -right-3 -top-1.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-indigo-700 px-1 text-[9px] leading-4 tabular-nums text-white ring-2 ring-white">{count > 99 ? "99+" : count}</span>}
            </span>
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default NavMobile;