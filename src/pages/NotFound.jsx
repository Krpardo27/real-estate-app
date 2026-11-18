import { Link, useRouteError } from "react-router-dom";
import Seo from "../components/Seo.jsx";

export default function NotFound() {
  const error = useRouteError();
  return <div className="page-container py-20">
    <Seo title={error ? "No se pudo cargar la página" : "Página no encontrada"} description="Vuelve al inicio o explora el catálogo de propiedades." noindex />
    <p className="text-sm font-medium text-indigo-700">HomeEstate</p>
    <h1 className="mt-3 text-2xl font-semibold">{error ? "No se pudo cargar la página" : "Esta página no está disponible"}</h1>
    <p className="mt-4 max-w-lg text-slate-600">{error ? "Comprueba tu conexión y vuelve a intentarlo. Si acabamos de actualizar el sitio, recarga la página." : "El enlace puede haber cambiado. Puedes continuar explorando el catálogo."}</p>
    <div className="mt-6 flex flex-wrap gap-4"><Link className="button-primary" to="/">Volver al inicio</Link><Link className="button-secondary" to="/search">Buscar propiedades</Link>{error && <button className="button-secondary" onClick={() => window.location.reload()}>Reintentar</button>}</div>
  </div>;
}