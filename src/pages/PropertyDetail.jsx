import { Link, useParams } from "react-router-dom";
import { IoLocationOutline, IoCallOutline } from "react-icons/io5";
import { useProperty } from "../hooks/useProperty.js";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import MiniLoader from "../components/MiniLoader.jsx";
import PropertyGallery from "../components/PropertyGallery.jsx";
import Seo from "../components/Seo.jsx";
import { CONTACT_EMAIL, CONTACT_PHONE } from "../utils/contact.js";

const searchLink = (values) => `/search?${new URLSearchParams(values)}`;
const displayNumber = (value, suffix = "") => Number.isFinite(value) && value >= 0
  ? `${value.toLocaleString("es-CL")}${suffix}` : "No disponible";

const PropertyDetail = () => {
  const { id } = useParams();
  const { data: property, isLoading, isError } = useProperty(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <Seo title="Cargando propiedad" description="Ficha del catálogo de demostración." noindex />
        <h1 className="sr-only">Detalle de la propiedad</h1>
        <MiniLoader label="Cargando la propiedad…" />
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <Seo title="Propiedad no encontrada" description="Explora otras propiedades del catálogo de demostración." noindex />
        <h1 className="text-2xl font-semibold text-slate-900">Propiedad no encontrada</h1>
        <p className="mt-3 text-slate-600">No pudimos encontrar esta ficha en el catálogo.</p>
        <Link to="/search" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-slate-900 px-4 py-2 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-2">Explorar propiedades</Link>
      </div>
    );
  }

  const cityParams = property.city ? { city: property.city } : {};
  const districtParams = { ...cityParams, ...(property.district ? { district: property.district } : {}) };
  const similarParams = { ...cityParams, ...(property.type ? { type: property.type } : {}) };
  const reference = String(property.id);
  const email = typeof CONTACT_EMAIL === "string" ? CONTACT_EMAIL.trim() : "";
  const phone = typeof CONTACT_PHONE === "string" ? CONTACT_PHONE.trim() : "";
  const mailto = email ? `mailto:${email}?subject=${encodeURIComponent(`Consulta sobre el catálogo de demostración · Referencia ${reference}`)}` : null;
  const tel = phone ? `tel:${phone.replace(/[\s().-]/g, "")}` : null;
  const stats = [
    ...(["house", "apartment"].includes(property.type) ? [{ label: "Dormitorios", value: displayNumber(property.bedrooms) }] : []),
    ...(property.type !== "land" ? [{ label: "Baños", value: displayNumber(property.bathrooms) }] : []),
    { label: "Superficie", value: displayNumber(property.area, " m²") },
  ];

  return (
    <article className="max-w-7xl mx-auto px-4 py-8 md:py-10">
      <Seo title={property.title} description={property.description || "Ficha del catálogo inmobiliario de demostración."} image={property.images?.[0]} noindex />
      <Breadcrumbs items={[
        { label: "Propiedades", href: "/search" },
        ...(property.city ? [{ label: property.city, href: searchLink(cityParams) }] : []),
        ...(property.district && property.district !== property.city ? [{ label: property.district, href: searchLink(districtParams) }] : []),
        { label: property.title },
      ]} />
      <header className="mb-6 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-end">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Propiedad de demostración</p>
          <h1 className="wrap-break-word text-2xl font-semibold text-slate-900 sm:text-3xl">{property.title}</h1>
          {property.location && <p className="mt-2 flex items-start gap-1 text-sm text-slate-600"><IoLocationOutline aria-hidden="true" className="mt-0.5 shrink-0" />{property.location}</p>}
        </div>
        <div className="max-w-full lg:text-right">
          <p className="text-sm text-slate-500">Precio de referencia</p>
          <p className="wrap-break-word text-2xl font-semibold text-slate-900 sm:text-3xl">{Number.isFinite(property.price) && property.price >= 0 ? `$${property.price.toLocaleString("es-CL")} CLP` : "Precio no disponible"}</p>
        </div>
      </header>
      <PropertyGallery images={property.images} title={property.title} />
      <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <section aria-labelledby="property-features" className="mb-8 border-b border-slate-200 pb-8">
            <h2 id="property-features" className="mb-4 text-xl font-semibold text-slate-900">Características</h2>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {stats.map(({ label, value }) => (
                <div key={label} className="min-w-0 rounded-md bg-slate-50 p-3 sm:p-4">
                  <dt className="text-xs text-slate-600 sm:text-sm">{label}</dt>
                  <dd className="mt-1 wrap-break-word text-base font-semibold text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section aria-labelledby="property-description">
            <h2 id="property-description" className="mb-4 text-xl font-semibold text-slate-900">Descripción</h2>
            <p className="whitespace-pre-line wrap-break-word leading-relaxed text-slate-600">{property.description || "No hay descripción disponible para esta propiedad."}</p>
          </section>
        </div>
        <aside aria-labelledby="property-contact" className="min-w-0">
          <div className="rounded-lg border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
            <h2 id="property-contact" className="mb-4 text-xl font-semibold text-slate-900">Sobre este catálogo</h2>
            <p className="text-sm leading-relaxed text-slate-600">Este catálogo es de demostración. No se reciben solicitudes por estas propiedades.</p>
            {(mailto || tel) && (
              <div className="mt-5 space-y-3">
                <p className="text-sm text-slate-600">Para consultas generales sobre el catálogo:</p>
                {mailto && <>
                  <a href={mailto} className="flex min-h-11 items-center justify-center rounded-md bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2">Escribir por correo</a>
                  <p className="text-xs leading-relaxed text-slate-500">Abre tu aplicación de correo. No se envía ninguna solicitud desde este sitio.</p>
                </>}
                {tel && <a href={tel} className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-3 text-sm font-medium text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2"><IoCallOutline aria-hidden="true" />Llamar al contacto del catálogo</a>}
              </div>
            )}
            <Link to={searchLink(similarParams)} className="mt-5 inline-flex min-h-11 items-center text-sm text-slate-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2">Explorar propiedades similares</Link>
            <p className="mt-4 wrap-break-word text-xs text-slate-500">Referencia: {reference}</p>
          </div>
        </aside>
      </div>
    </article>
  );
};

export default PropertyDetail;
