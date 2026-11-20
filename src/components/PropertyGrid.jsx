import { properties } from "../data/properties.js";
import PropertyCard from "./PropertyCard.jsx";
import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";
import { motion as Motion } from "framer-motion";
import { useEntranceMotion } from "../hooks/useEntranceMotion.js";

const PropertyGrid = () => {
  const entrance = useEntranceMotion();
  // Una muestra por tipo residencial, sin modificar el catálogo ni sus IDs.
  const featured = ["house", "apartment", "land"].map((type) => properties.find((property) => property.type === type)).filter(Boolean);

  return (
    <section id="propiedades" className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16" aria-labelledby="featured-title">
      <Motion.div {...entrance()} className="mb-8 flex flex-col gap-5 sm:mb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 sm:text-[11px]">Una primera selección</p>
          <h2 id="featured-title" className="mt-3 text-2xl font-medium leading-tight tracking-[-0.035em] text-slate-900 sm:text-[30px]">Espacios que vale la pena explorar</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Casas, departamentos y terrenos. Compara precios y características, y guarda los que te interesen.</p>
        </div>
        <Link to="/search?filters=all" className="inline-flex min-h-11 shrink-0 items-center gap-2 text-xs font-semibold text-indigo-800 underline decoration-indigo-300 underline-offset-8 transition-colors hover:text-indigo-950 hover:decoration-indigo-800 sm:text-sm">Ver todas las propiedades <FiArrowUpRight size={17} aria-hidden="true" /></Link>
      </Motion.div>

      <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((property, index) => (
          <PropertyCard key={property.id} property={property} variant="editorial" imageMotion={entrance(index)} />
        ))}
      </div>
      <p className="mt-6 text-xs leading-5 text-slate-500">Selección de demostración. Precios, características y fotografías ilustrativos.</p>
    </section>
  );
};

export default PropertyGrid;
