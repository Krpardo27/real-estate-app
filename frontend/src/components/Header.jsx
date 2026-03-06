import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiUser } from "react-icons/fi";

const Header = () => {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setCompact(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ease-in-out border-b drop-shadow-xl
      ${
        compact
          ? "bg-white/80 backdrop-blur-md border-zinc-200 py-2 shadow-sm"
          : "bg-white border-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-6">
        <Link
          to="/"
          className={`font-bold text-indigo-600 origin-left transition-transform duration-300
          ${compact ? "scale-90" : "scale-110"}`}
        >
          HomeRadar
        </Link>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl hover:bg-zinc-100 transition-colors">
            <FiHeart size={compact ? 18 : 20} className="transition-all" />
          </button>
          <button className="p-2 rounded-xl hover:bg-zinc-100 transition-colors">
            <FiUser size={compact ? 18 : 20} className="transition-all" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
