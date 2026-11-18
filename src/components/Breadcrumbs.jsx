import { Link } from "react-router-dom";
import { FiChevronRight, FiHome } from "react-icons/fi";

const Breadcrumbs = ({ items = [] }) => {
  return (
    <nav aria-label="Ruta de navegación" className="text-sm text-slate-600 mb-6">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link to="/" className="inline-flex min-h-11 items-center gap-1 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2">
            <FiHome aria-hidden="true" /> Inicio
          </Link>
        </li>
        {items.filter((item) => item?.label).map((item, index, entries) => {
          const isLast = index === entries.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-2">
              <FiChevronRight aria-hidden="true" className="shrink-0 text-slate-400" />
              {isLast || !item.href ? (
                <span aria-current={isLast ? "page" : undefined} className="wrap-break-word font-medium text-slate-800">{item.label}</span>
              ) : (
                <Link to={item.href} className="inline-flex min-h-11 items-center wrap-break-word hover:underline focus-visible:outline-2 focus-visible:outline-offset-2">{item.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
