import { FiHeart } from "react-icons/fi";
import { LuBedDouble, LuBath, LuRuler } from "react-icons/lu";
import { Link } from "react-router-dom";
import PropertyImage from "./PropertyImage.jsx";
import { useFavorites } from "../hooks/useFavorites.js";
import { formatPrice } from "../utils/formatPrice.js";
import { propertyTypes } from "../data/propertyTypes.js";
import { m as Motion } from "framer-motion";

const PropertyCard = ({ property, variant = "default", onRemoveFavorite, imageMotion }) => {
  const editorial = variant === "editorial";
  const image = property.images?.[0];
  const { ids, toggle } = useFavorites();
  const saved = ids.includes(property.id);
  const photo = <PropertyImage src={image} width={800} alt="" loading="lazy" className="w-full h-full object-cover" />;

  return (
    <article className={editorial ? "group min-w-0" : "group min-w-0 bg-white rounded-lg overflow-hidden border border-zinc-200 transition-colors hover:border-indigo-300"}>
      <div className="relative aspect-4/3 overflow-hidden">
        <Link
          to={`/property/${property.id}`}
          className="block h-full"
          tabIndex={-1}
          aria-hidden="true"
        >
          {imageMotion ? <Motion.div {...imageMotion} className="h-full">{photo}</Motion.div> : photo}
        </Link>

        <button type="button" data-save-property={property.id} onClick={(event) => { event.preventDefault(); event.stopPropagation(); if (saved) onRemoveFavorite?.(event.currentTarget); toggle(property.id); }} aria-pressed={saved} aria-label={`${saved ? "Quitar de guardados" : "Guardar"}: ${property.title}, referencia ${property.id}`} className="absolute top-3 right-3 flex min-h-11 min-w-11 items-center justify-center bg-white rounded-full text-indigo-700 shadow-sm hover:bg-indigo-50 transition-colors">
          <FiHeart size={19} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
        </button>
      </div>

      <div className={editorial ? "space-y-2 pt-5" : "p-4 space-y-2"}>
        {editorial && <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{propertyTypes.find((type) => type.value === property.type)?.label} · Catálogo demo</p>}
        <p className={editorial ? "text-[22px] font-semibold tracking-tight text-slate-900" : "text-lg font-semibold text-zinc-900"}>
          {formatPrice(property.price)}
          <span className="ml-1 text-xs font-normal text-slate-600">CLP</span>
        </p>

        <h3 className={editorial ? "text-base font-medium text-slate-800" : "text-sm font-medium text-zinc-800"}><Link to={`/property/${property.id}`} className="hover:text-indigo-700 hover:underline underline-offset-4">{property.title}</Link></h3>
        <p className="text-xs text-slate-600">{property.city}</p>

        <div className={`flex flex-wrap gap-3 items-center text-zinc-600 text-sm border-t ${editorial ? "mt-4 justify-start gap-x-6 border-stone-200 pt-4" : "justify-between border-slate-100 pt-2"}`}>
          {["house", "apartment"].includes(property.type) && <span className="flex items-center gap-1">
            <LuBedDouble size={16} aria-hidden="true" />
            <span aria-hidden="true">{property.bedrooms}</span><span className="sr-only">{property.bedrooms} dormitorios</span>
          </span>}

          {property.type !== "land" && <span className="flex items-center gap-1">
            <LuBath size={16} aria-hidden="true" />
            <span aria-hidden="true">{property.bathrooms}</span><span className="sr-only">{property.bathrooms} baños</span>
          </span>}

          <span className="flex items-center gap-1">
            <LuRuler size={16} aria-hidden="true" />
            <span aria-hidden="true">{property.area} m²</span><span className="sr-only">{property.area} metros cuadrados</span>
          </span>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
