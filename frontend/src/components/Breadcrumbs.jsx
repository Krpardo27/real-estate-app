import { Link } from "react-router-dom";
import { FiChevronRight, FiHome } from "react-icons/fi";

const Breadcrumbs = ({ items = [] }) => {
  return (
    <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6 flex-wrap">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-blue-600 transition"
      >
        <FiHome />
        Home
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            <FiChevronRight className="text-slate-400" />

            {isLast ? (
              <span className="font-medium text-slate-800">{item.label}</span>
            ) : (
              <Link to={item.href} className="hover:text-blue-600 transition">
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
