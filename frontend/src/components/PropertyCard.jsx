import { FiHeart } from "react-icons/fi";
import { LuBedDouble, LuBath, LuRuler } from "react-icons/lu";
import { Link } from "react-router-dom";
import { cld } from "../utils/cloudinary.js";
import { formatPrice } from "../utils/formatPrice.js";

const PropertyCard = ({ property }) => {
  const image = property.images?.[0];

  const src = image?.startsWith("http")
    ? image
    : cld(image);

  const srcSet = image?.startsWith("http")
    ? undefined
    : `
      ${cld(image, 400)} 400w,
      ${cld(image, 800)} 800w,
      ${cld(image, 1200)} 1200w
    `;

  return (
    <article className="group bg-white rounded-xl overflow-hidden border border-zinc-200 hover:shadow-lg transition">
      <div className="relative aspect-4-3 overflow-hidden">
        <Link
          to={`/property/${property.id}`}
          state={{
            city: property.city,
            district: property.district,
            from: "search",
            scrollY: window.scrollY,
          }}
        >
          <img
            src={src}
            srcSet={srcSet}
            sizes="(max-width:768px) 100vw, 400px"
            alt={property.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </Link>

        <button className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full hover:bg-white transition">
          <FiHeart size={18} />
        </button>
      </div>

      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold text-zinc-900">
          {formatPrice(property.price)}
        </h3>

        <p className="text-sm text-zinc-600 line-clamp-1">
          {property.title}
        </p>

        <div className="flex items-center justify-between text-zinc-500 text-sm pt-2">
          <span className="flex items-center gap-1">
            <LuBedDouble size={16} />
            {property.bedrooms}
          </span>

          <span className="flex items-center gap-1">
            <LuBath size={16} />
            {property.bathrooms}
          </span>

          <span className="flex items-center gap-1">
            <LuRuler size={16} />
            {property.area}m²
          </span>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
