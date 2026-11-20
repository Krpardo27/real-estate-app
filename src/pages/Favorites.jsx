import { Link } from "react-router-dom";
import { properties } from "../data/properties.js";
import { useFavorites } from "../hooks/useFavorites.js";
import PropertyCard from "../components/PropertyCard.jsx";
import Seo from "../components/Seo.jsx";
import { useRef } from "react";

export default function Favorites() {
  const { ids, persistent } = useFavorites();
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const restoreFocus = (button) => {
    if (document.activeElement !== button) return;
    const buttons = [...rootRef.current.querySelectorAll("[data-save-property]")];
    const index = buttons.indexOf(button);
    const next = buttons[index + 1] || buttons[index - 1];
    requestAnimationFrame(() => {
      if (next?.isConnected) next.focus({ preventScroll: true });
      else headingRef.current?.focus({ preventScroll: true });
    });
  };
  const saved = properties.filter((property) => ids.includes(property.id));
  return <div ref={rootRef} className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
    <Seo title="Propiedades guardadas" description="Tus propiedades guardadas en este navegador." noindex />
    <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold">Propiedades guardadas</h1>
    <p className="mt-3 mb-8 text-sm text-slate-600">{persistent ? "Se guardan solo en este navegador, sin crear una cuenta." : "El navegador no permite guardar datos. La selección se conserva solo en esta pestaña y se perderá al recargar."}</p>
    <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">{saved.length} {saved.length === 1 ? "propiedad guardada" : "propiedades guardadas"}</p>
    {saved.length ? <section aria-labelledby="favorites-selection"><h2 id="favorites-selection" className="sr-only">Tu selección</h2><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{saved.map((property) => <PropertyCard key={property.id} property={property} onRemoveFavorite={restoreFocus} />)}</div></section> : <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-10">
      <h2 className="font-semibold">Aún no has guardado propiedades</h2>
      <p className="mt-2 text-sm text-slate-600">Usa el corazón de cada ficha para comparar tus opciones aquí.</p>
      <Link to="/search?filters=all" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">Explorar propiedades</Link>
    </div>}
  </div>;
}