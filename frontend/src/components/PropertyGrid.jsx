import { properties } from "../data/properties.js";
import PropertyCard from "./PropertyCard.jsx";

const PropertyGrid = () => {
  return (
    <section className="px-4 sm:px-6 py-10">
      <h2 className="text-2xl font-bold mb-6">Propiedades destacadas</h2>

      <div
        className="
        grid
        gap-6
        grid-cols-[repeat(auto-fit,minmax(260px,1fr))]
        "
      >
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
};

export default PropertyGrid;
