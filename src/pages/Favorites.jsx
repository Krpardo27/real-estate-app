import { Link } from "react-router-dom";
import { properties } from "../data/properties.js";
import { useFavorites } from "../hooks/useFavorites.js";
import PropertyCard from "../components/PropertyCard.jsx";
import Seo from "../components/Seo.jsx";

export default function Favorites() {
  const { ids, persistent } = useFavorites();
  const saved = properties.filter((property) => ids.includes(property.id));
  return <div className="page-container py-10">
    <Seo title="Propiedades guardadas" description="Tus propiedades guardadas en este navegador." noindex />
    <h1 className="text-2xl font-semibold">Propiedades guardadas</h1>
    <p className="mt-3 mb-8 text-sm text-slate-600">{persistent ? "Se guardan solo en este navegador, sin crear una cuenta." : "El navegador no permite guardar datos. La selección se conserva solo en esta pestaña y se perderá al recargar."}</p>
    <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">{saved.length} {saved.length === 1 ? "propiedad guardada" : "propiedades guardadas"}</p>
    {saved.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{saved.map((property) => <PropertyCard key={property.id} property={property} />)}</div> : <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-10">
      <h2 className="font-semibold">Aún no has guardado propiedades</h2>
      <p className="mt-2 text-sm text-slate-600">Usa el corazón de cada ficha para comparar tus opciones aquí.</p>
      <Link to="/search?filters=all" className="button-primary mt-6">Explorar propiedades</Link>
    </div>}
  </div>;
}