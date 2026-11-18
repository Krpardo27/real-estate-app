import { FiHeart } from "react-icons/fi";
import { LuBedDouble, LuBath, LuRuler } from "react-icons/lu";
import { Link } from "react-router-dom";
import PropertyImage from "./PropertyImage.jsx";
import { useFavorites } from "../hooks/useFavorites.js";
import { formatPrice } from "../utils/formatPrice.js";

const PropertyCard = ({ property }) => {
  const image = property.images?.[0];
  const { ids, toggle } = useFavorites();
  const saved = ids.includes(property.id);

  return (
    <article className="group min-w-0 bg-white rounded-lg overflow-hidden border border-zinc-200 transition-colors hover:border-indigo-300">
      <div className="relative aspect-4/3 overflow-hidden">
        <Link
          to={`/property/${property.id}`}
          className="block h-full"
          tabIndex={-1}
          aria-hidden="true"
        >
          <PropertyImage
            src={image}
            width={800}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </Link>

        <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); toggle(property.id); }} aria-pressed={saved} aria-label={`${saved ? "Quitar de guardados" : "Guardar"}: ${property.title}, referencia ${property.id}`} className="absolute top-3 right-3 flex min-h-11 min-w-11 items-center justify-center bg-white rounded-full text-indigo-700 shadow-sm hover:bg-indigo-50 transition-colors">
          <FiHeart size={19} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
        </button>
      </div>

      <div className="p-4 space-y-2">
        <p className="text-lg font-semibold text-zinc-900">
          {formatPrice(property.price)}
          <span className="ml-1 text-xs font-normal text-slate-600">CLP</span>
        </p>

        <h3 className="text-sm font-medium text-zinc-800"><Link to={`/property/${property.id}`} className="hover:text-indigo-700 hover:underline underline-offset-4">{property.title}</Link></h3>
        <p className="text-xs text-slate-600">{property.city}</p>

        <div className="flex flex-wrap gap-3 items-center justify-between text-zinc-600 text-sm pt-2 border-t border-slate-100">
          {["house", "apartment"].includes(property.type) && <span className="flex items-center gap-1" aria-label={`${property.bedrooms} dormitorios`}>
            <LuBedDouble size={16} aria-hidden="true" />
            {property.bedrooms}
          </span>}

          {property.type !== "land" && <span className="flex items-center gap-1" aria-label={`${property.bathrooms} baños`}>
            <LuBath size={16} aria-hidden="true" />
            {property.bathrooms}
          </span>}

          <span className="flex items-center gap-1" aria-label={`${property.area} metros cuadrados`}>
            <LuRuler size={16} aria-hidden="true" />
            {property.area}m²
          </span>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
