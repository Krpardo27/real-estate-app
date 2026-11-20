import { Link, useRouteError } from "react-router-dom";
import Seo from "../components/Seo.jsx";

export default function NotFound() {
  const error = useRouteError();
  return <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
    <Seo title={error ? "No se pudo cargar la página" : "Página no encontrada"} description="Vuelve al inicio o explora el catálogo de propiedades." noindex />
    <p className="text-sm font-medium text-indigo-700">HomeEstate</p>
    <h1 className="mt-3 text-2xl font-semibold">{error ? "No se pudo cargar la página" : "Esta página no está disponible"}</h1>
    <p className="mt-4 max-w-lg text-slate-600">{error ? "Comprueba tu conexión y vuelve a intentarlo. Si acabamos de actualizar el sitio, recarga la página." : "El enlace puede haber cambiado. Puedes continuar explorando el catálogo."}</p>
    <div className="mt-6 flex flex-wrap gap-4">
      <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700" to="/">Volver al inicio</Link>
      <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100" to="/search">Buscar propiedades</Link>
      {error && <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100" onClick={() => window.location.reload()}>Reintentar</button>}
    </div>
  </div>;
}