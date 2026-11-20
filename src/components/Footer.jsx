import { Link } from "react-router-dom";
import { FiHome } from "react-icons/fi";
import { cities } from "../data/cities";
import { CONTACT_EMAIL, CONTACT_PHONE } from "../utils/contact";

const categories = [
  { type: "house", label: "Casas" },
  { type: "apartment", label: "Departamentos" },
  { type: "land", label: "Terrenos" },
  { type: "office", label: "Oficinas" },
];
const linkClass = "inline-flex min-h-11 items-center rounded-sm py-2 text-sm text-slate-300 underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

const Footer = () => (
  <footer className="border-t border-slate-800 bg-slate-900 text-slate-300">
    <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:gap-10 lg:py-14">
      <div className="col-span-2 sm:col-span-1">
        <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-sm text-xl font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          <FiHome aria-hidden="true" />
          HomeEstate
        </Link>
        <p className="mt-3 max-w-xs text-sm leading-6">
          Catálogo de demostración de propiedades en Chile. Los anuncios y precios son ficticios; no se realizan transacciones.
        </p>
      </div>

      <nav aria-labelledby="footer-properties-title">
        <h2 id="footer-properties-title" className="mb-2 text-sm font-semibold text-white">Por tipo de propiedad</h2>
        <ul>
          {categories.map(({ type, label }) => (
            <li key={type}><Link to={`/search?type=${type}`} className={linkClass}>{label}</Link></li>
          ))}
        </ul>
      </nav>

      <nav aria-labelledby="footer-cities-title">
        <h2 id="footer-cities-title" className="mb-2 text-sm font-semibold text-white">Ciudades del catálogo</h2>
        <ul>
          {cities.map((city) => (
            <li key={city.name}>
              <Link to={`/search?city=${encodeURIComponent(city.name)}`} className={linkClass}>{city.name}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0 col-span-2 sm:col-span-1">
        <nav aria-labelledby="footer-explore-title">
          <h2 id="footer-explore-title" className="mb-2 text-sm font-semibold text-white">Explorar</h2>
          <ul>
            <li><Link to="/search?filters=all" className={linkClass}>Todas las propiedades</Link></li>
            <li><Link to="/map?filters=all" className={linkClass}>Ver mapa</Link></li>
            <li><Link to="/favorites" className={linkClass}>Mis guardados</Link></li>
          </ul>
        </nav>
        {(CONTACT_EMAIL || CONTACT_PHONE) && (
          <div className="mt-5">
            <h2 className="mb-2 text-sm font-semibold text-white">Contacto</h2>
            {CONTACT_EMAIL && <a href={`mailto:${CONTACT_EMAIL}`} className={`${linkClass} break-all`}>{CONTACT_EMAIL}</a>}
            {CONTACT_PHONE && <a href={`https://wa.me/${CONTACT_PHONE.slice(1)}`} className={`${linkClass} flex`}>WhatsApp: {CONTACT_PHONE}</a>}
          </div>
        )}
      </div>
    </div>
    <div className="border-t border-slate-700">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-xs leading-5 text-slate-300 sm:flex-row sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} HomeEstate</p>
        <p>Proyecto de demostración · Imágenes ilustrativas</p>
      </div>
    </div>
  </footer>
);

export default Footer;
