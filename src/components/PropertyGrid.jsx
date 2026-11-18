import { properties } from "../data/properties.js";
import PropertyCard from "./PropertyCard.jsx";
import { Link } from "react-router-dom";

const PropertyGrid = () => {
  // Una fila editorial en portada; el catálogo completo conserva sus 120 fichas.
  const featured = properties.slice(0, 4);

  return (
    <section id="propiedades" className="home-section" aria-labelledby="featured-title">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="h-6 w-0.75 bg-indigo-600 rounded-full" aria-hidden="true"></span>
          <h2 id="featured-title" className="text-2xl md:text-3xl font-semibold text-gray-900">
            Propiedades destacadas
          </h2>
        </div>

        <p className="text-slate-600 text-sm">
          Una selección del catálogo para explorar ubicaciones y características.
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
      <div className="mt-8 text-center"><Link to="/search" className="button-secondary">Ver todas las propiedades</Link></div>
    </section>
  );
};

export default PropertyGrid;
