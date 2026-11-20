import { Link, useParams } from "react-router-dom";
import { IoLocationOutline, IoCallOutline } from "react-icons/io5";
import { FiArrowLeft, FiArrowUpRight, FiHeart, FiInfo, FiMapPin } from "react-icons/fi";
import { LuBedDouble, LuBath, LuRuler } from "react-icons/lu";
import { useProperty } from "../hooks/useProperty.js";
import { useFavorites } from "../hooks/useFavorites.js";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import MiniLoader from "../components/MiniLoader.jsx";
import PropertyGallery from "../components/PropertyGallery.jsx";
import PropertyCard from "../components/PropertyCard.jsx";
import Seo from "../components/Seo.jsx";
import { CONTACT_EMAIL, CONTACT_PHONE } from "../utils/contact.js";
import { properties } from "../data/properties.js";
import { propertyTypes } from "../data/propertyTypes.js";
import { chileRegions } from "../data/regions.js";

const searchLink = (values) => `/search?${new URLSearchParams(values)}`;
const displayNumber = (value, suffix = "") => Number.isFinite(value) && value >= 0
  ? `${value.toLocaleString("es-CL")}${suffix}` : "No disponible";

const PropertyDetail = () => {
  const { id } = useParams();
  const { data: property, isLoading, isError } = useProperty(id);
  const { ids, toggle, persistent } = useFavorites();

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
      <div className="mx-auto w-full max-w-7xl px-4 py-20 text-center sm:px-6">
        <Seo title="Propiedad no encontrada" description="Explora otras propiedades del catálogo de demostración." noindex />
        <h1 className="text-2xl font-semibold text-slate-900">Propiedad no encontrada</h1>
        <p className="mt-3 text-slate-600">No pudimos encontrar esta ficha en el catálogo.</p>
        <Link to="/search?filters=all" className="mt-6 inline-flex min-h-11 items-center rounded-sm bg-slate-900 px-5 py-3 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-2">Explorar propiedades</Link>
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
  const saved = ids.includes(property.id);
  const typeLabel = propertyTypes.find((type) => type.value === property.type)?.label || "Propiedad";
  const regionLabel = chileRegions.find((region) => Number(region.id) === Number(property.region))?.name;
  const mapLink = `/map?${new URLSearchParams(districtParams)}`;
  const nearby = propertyTypes.map(({ value }) => properties.find((entry) => entry.id !== property.id && entry.city === property.city && entry.type === value)).filter(Boolean).slice(0, 3);
  const stats = [
    ...(["house", "apartment"].includes(property.type) ? [{ label: "Dormitorios", value: displayNumber(property.bedrooms), Icon: LuBedDouble }] : []),
    ...(property.type !== "land" ? [{ label: "Baños", value: displayNumber(property.bathrooms), Icon: LuBath }] : []),
    { label: "Superficie", value: displayNumber(property.area, " m²"), Icon: LuRuler },
  ];

  return (
    <div className="bg-[#fcfbf8]">
    <article className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
      <Seo title={property.title} description={property.description || "Ficha del catálogo inmobiliario de demostración."} image={property.images?.[0]} noindex />
      <div className="border-b border-stone-200 pb-3 [&_nav]:mb-0 [&_nav]:text-xs">
        <Breadcrumbs items={[
          { label: "Propiedades", href: "/search?filters=all" },
          ...(property.city ? [{ label: property.city, href: searchLink(cityParams) }] : []),
          ...(property.district && property.district !== property.city ? [{ label: property.district, href: searchLink(districtParams) }] : []),
          { label: property.title },
        ]} />
      </div>
      <div className="my-4 flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
        <Link to={searchLink(cityParams)} className="inline-flex min-h-11 items-center gap-2 text-xs font-medium text-slate-600 hover:text-indigo-800"><FiArrowLeft size={15} aria-hidden="true" /><span>Ver propiedades<span className="hidden sm:inline">{property.city ? ` en ${property.city}` : ""}</span></span></Link>
        <button
          type="button"
          onClick={() => toggle(property.id)}
          aria-pressed={saved}
          aria-label={`${saved ? "Quitar de guardados" : "Guardar"}: ${property.title}, referencia ${reference}`}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border px-4 py-2 text-xs font-semibold transition-colors ${saved ? "border-indigo-300 bg-indigo-50 text-indigo-800 hover:bg-indigo-100" : "border-stone-300 bg-white text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-800"}`}
        >
          <FiHeart size={17} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
          {saved ? "Quitar de guardados" : "Guardar"}
        </button>
      </div>
      {!persistent && <p role="status" className="mb-4 text-xs leading-5 text-slate-600">La selección se conserva solo en esta pestaña.</p>}
      <header className="mb-7 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end lg:gap-10">
        <div className="min-w-0">
          <p className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600"><span>{typeLabel}</span><span aria-hidden="true" className="h-3 w-px bg-stone-300" /><span>Referencia {reference}</span></p>
          <h1 className="wrap-break-word text-[28px] font-medium leading-tight tracking-[-0.035em] text-slate-900 sm:text-4xl">{property.title}</h1>
          {property.location && <p className="mt-3 flex items-start gap-1.5 text-sm leading-6 text-slate-600"><IoLocationOutline size={18} aria-hidden="true" className="mt-0.5 shrink-0" />{property.location}</p>}
        </div>
        <div className="max-w-full border-l-2 border-indigo-700 pl-4 lg:shrink-0 lg:border-l-0 lg:pl-0 lg:text-right">
          <p className="mb-1 text-xs text-slate-600">Precio de referencia</p>
          <p className="wrap-break-word text-[28px] font-semibold leading-tight tracking-[-0.035em] text-slate-900 sm:text-[32px]">{Number.isFinite(property.price) && property.price >= 0 ? <><span>${property.price.toLocaleString("es-CL")}</span><span className="ml-2 text-xs font-medium tracking-normal text-slate-500">CLP</span></> : "Precio no disponible"}</p>
          <p className="mt-2 text-[10px] leading-5 text-slate-500">Propiedad de demostración · No disponible para compra</p>
        </div>
      </header>
      <PropertyGallery images={property.images} title={property.title} />
      <div className="grid min-w-0 items-start gap-10 pb-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
        <div className="min-w-0">
          <section aria-labelledby="property-features" className="mb-9 border-b border-stone-200 pb-8">
            <h2 id="property-features" className="mb-6 text-lg font-semibold tracking-tight text-slate-900">Características</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3">
              {stats.map(({ label, value, Icon }) => (
                <div key={label} className="min-w-0 border-l border-stone-300 pl-4">
                  <dt className="flex items-center gap-2 text-xs text-slate-600"><Icon size={18} strokeWidth={1.4} aria-hidden="true" />{label}</dt>
                  <dd className="mt-3 wrap-break-word text-2xl font-medium tracking-tight text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section aria-labelledby="property-description" className="mb-9 border-b border-stone-200 pb-8">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Conoce el espacio</p>
            <h2 id="property-description" className="mb-4 text-2xl font-medium tracking-tight text-slate-900">Descripción</h2>
            <p className="mb-4 text-sm leading-7 text-slate-700">{typeLabel}{property.location ? ` en ${property.location}` : ""}{Number.isFinite(property.area) && property.area >= 0 ? `, con ${displayNumber(property.area, " m²")} de superficie` : ""}. Consulta sus características y compara otras opciones del catálogo en la misma ciudad.</p>
            <p className="whitespace-pre-line wrap-break-word text-sm leading-7 text-slate-600">{property.description || "No hay descripción adicional disponible para esta propiedad."}</p>
          </section>
          <section aria-labelledby="property-location">
            <h2 id="property-location" className="mb-4 text-2xl font-medium tracking-tight text-slate-900">Ubicación de referencia</h2>
            <div className="border border-stone-200 bg-[#f3f2ee] p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <FiMapPin size={23} strokeWidth={1.4} className="mt-1 shrink-0 text-indigo-800" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-base font-medium text-slate-900">{property.location || "Ubicación no disponible"}</p>
                  {regionLabel && <p className="mt-1 text-xs leading-6 text-slate-600">Región: {regionLabel}</p>}
                  <p className="mt-3 max-w-lg text-xs leading-6 text-slate-600">La ubicación es aproximada y corresponde a una referencia de la comuna, no a una dirección real del inmueble.</p>
                  <Link to={mapLink} className="mt-3 inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-indigo-800 underline underline-offset-4 hover:text-indigo-950">Explorar esta zona <FiArrowUpRight size={15} aria-hidden="true" /></Link>
                </div>
              </div>
            </div>
          </section>
        </div>
        <aside aria-labelledby="property-explore" className="min-w-0 border border-stone-200 border-t-2 border-t-indigo-700 bg-white p-5 sm:p-6 lg:sticky lg:top-24">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Sigue explorando</p>
          <h2 id="property-explore" className="text-xl font-medium tracking-tight text-slate-900">Compara antes de elegir</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Revisa otras opciones de la misma ciudad o explora las propiedades cercanas en el mapa.</p>
          <Link to={searchLink(similarParams)} className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-sm bg-indigo-700 px-4 py-3 text-center text-xs font-semibold text-white transition-colors hover:bg-indigo-800">Explorar propiedades similares <FiArrowUpRight size={16} className="shrink-0" aria-hidden="true" /></Link>
          <Link to={mapLink} className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-sm border border-stone-300 px-4 py-3 text-center text-xs font-medium text-slate-800 transition-colors hover:border-indigo-300 hover:bg-indigo-50"><FiMapPin size={16} aria-hidden="true" />Ver zona en el mapa</Link>
          <div className="mt-6 border-t border-stone-200 pt-5">
            <div className="flex items-center gap-2 text-slate-700">
              <FiInfo size={16} aria-hidden="true" />
              <h3 id="property-contact" className="text-xs font-semibold">Sobre este catálogo</h3>
            </div>
            <p className="mt-3 text-xs leading-6 text-slate-600">Este catálogo es de demostración. Los precios y anuncios son ficticios. No se reciben solicitudes por estas propiedades.</p>
            {(mailto || tel) && <div className="mt-4 space-y-2 border-t border-stone-100 pt-4">
              <p className="text-xs leading-6 text-slate-600">Consultas generales sobre el catálogo:</p>
              {mailto && <>
                <a href={mailto} className="inline-flex min-h-11 items-center text-xs font-medium text-indigo-800 underline underline-offset-4 hover:text-indigo-950">Escribir por correo</a>
                <p className="text-[11px] leading-5 text-slate-500">Abre tu aplicación de correo. No se envía ninguna solicitud desde este sitio.</p>
              </>}
              {tel && <a href={tel} className="flex min-h-11 items-center gap-2 text-xs font-medium text-indigo-800 underline underline-offset-4 hover:text-indigo-950"><IoCallOutline aria-hidden="true" />Llamar al contacto del catálogo</a>}
            </div>}
            <p className="mt-4 text-[10px] text-slate-500">Referencia: {reference} · HomeEstate</p>
          </div>
        </aside>
      </div>
      {nearby.length > 0 && (
        <section aria-labelledby="property-nearby" className="border-t border-stone-200 py-10 sm:py-14">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Continúa tu búsqueda</p>
              <h2 id="property-nearby" className="text-2xl font-medium tracking-tight text-slate-900">Más propiedades{property.city ? ` en ${property.city}` : ""}</h2>
            </div>
            <Link to={searchLink(cityParams)} className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-indigo-800 underline underline-offset-4 hover:text-indigo-950">Ver todas en esta ciudad <FiArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {nearby.map((entry) => <PropertyCard key={entry.id} property={entry} variant="editorial" />)}
          </div>
        </section>
      )}
    </article>
    </div>
  );
};

export default PropertyDetail;
