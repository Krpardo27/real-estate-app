import { FiHeart } from "react-icons/fi";
import { LuBedDouble, LuBath, LuRuler } from "react-icons/lu";

const PropertyCard = ({ property }) => {
  return (
    <article className="group bg-white rounded-xl overflow-hidden border border-zinc-200 hover:shadow-lg transition">
      {/* image */}
      <div className="relative aspect-4-3 overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />

        {/* favorite */}
        <button className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full hover:bg-white transition">
          <FiHeart size={18} />
        </button>
      </div>

      {/* content */}
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold text-zinc-900">
          ${property.price}
        </h3>

        <p className="text-sm text-zinc-600 line-clamp-1">{property.title}</p>

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
