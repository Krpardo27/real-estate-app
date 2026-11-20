import { Link } from "react-router-dom";
import { useSiteNavigation } from "../hooks/useSiteNavigation.js";

const NavMobile = () => {
  const destinations = useSiteNavigation();

  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed bottom-[calc(var(--mobile-dock-gap)+env(safe-area-inset-bottom,0px))] left-1/2 z-50 h-[var(--mobile-dock-height)] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_4px_24px_rgb(15_23_42_/_12%)] md:hidden"
    >
      <div className="grid h-full grid-cols-4 gap-1">
        {destinations.map(({ to, label, Icon, active, count, accessibleLabel }) => (
          <Link
            key={label}
            to={to}
            aria-label={accessibleLabel}
            aria-current={active ? "page" : undefined}
            className={`relative flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 ${active ? "bg-indigo-50 text-indigo-800" : "text-slate-600 hover:bg-slate-50 hover:text-indigo-700"}`}
          >
            <span className="relative">
              <Icon size={21} aria-hidden="true" />
            </span>
            <span>{label}</span>{" "}
            {count > 0 && <span aria-hidden="true" className="absolute top-1 left-[calc(50%+4px)] inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-indigo-700 px-1 text-[9px] leading-4 tabular-nums text-white ring-2 ring-white">{count > 99 ? "99+" : count}</span>}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default NavMobile;