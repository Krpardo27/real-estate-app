import { Link } from "react-router-dom";
import { FiFacebook, FiInstagram, FiTwitter, FiMapPin } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-zinc-900 text-zinc-300 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
        {/* Brand */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Home Estate</h2>
          <p className="text-sm text-zinc-400">
            Encuentra tu próxima propiedad de forma simple, rápida y segura.
          </p>

          <div className="flex gap-4 text-lg">
            <FiFacebook className="hover:text-white cursor-pointer" />
            <FiInstagram className="hover:text-white cursor-pointer" />
            <FiTwitter className="hover:text-white cursor-pointer" />
          </div>
        </div>

        {/* Properties */}
        <div>
          <h3 className="text-white font-semibold mb-4">Propiedades</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/buy" className="hover:text-white">
                Comprar
              </Link>
            </li>
            <li>
              <Link to="/rent" className="hover:text-white">
                Arrendar
              </Link>
            </li>
            <li>
              <Link to="/new" className="hover:text-white">
                Proyectos nuevos
              </Link>
            </li>
            <li>
              <Link to="/luxury" className="hover:text-white">
                Propiedades premium
              </Link>
            </li>
          </ul>
        </div>

        {/* Cities */}
        <div>
          <h3 className="text-white font-semibold mb-4">Ciudades</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <FiMapPin /> Santiago
            </li>
            <li className="flex items-center gap-2">
              <FiMapPin /> Las Condes
            </li>
            <li className="flex items-center gap-2">
              <FiMapPin /> Vitacura
            </li>
            <li className="flex items-center gap-2">
              <FiMapPin /> Providencia
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-white font-semibold mb-4">Empresa</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/about" className="hover:text-white">
                Sobre nosotros
              </Link>
            </li>
            <li>
              <Link to="/careers" className="hover:text-white">
                Trabaja con nosotros
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white">
                Contacto
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-white font-semibold mb-4">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/privacy" className="hover:text-white">
                Privacidad
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-white">
                Términos
              </Link>
            </li>
            <li>
              <Link to="/cookies" className="hover:text-white">
                Cookies
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* bottom */}
      <div className="border-t border-zinc-800 py-6 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} Home Estate — Todos los derechos reservados
      </div>
    </footer>
  );
};

export default Footer;
