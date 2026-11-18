import { properties } from "../data/properties.js";
import PropertyCard from "./PropertyCard.jsx";

const PropertyGrid = () => {
  const featured = [...properties].slice(0, 12);

  return (
    <section>
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="h-6 w-[3px] bg-indigo-600 rounded-full"></span>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
            Propiedades destacadas
          </h2>
        </div>

        <p className="text-gray-500 text-sm">
          Descubre las mejores oportunidades inmobiliarias disponibles hoy.
        </p>
      </div>

      <div
        className="
        grid
        gap-6
        grid-cols-[repeat(auto-fit,minmax(260px,1fr))]
        "
      >
        {featured.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
};

export default PropertyGrid;
