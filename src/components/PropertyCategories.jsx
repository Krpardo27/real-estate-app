import { Link } from "react-router-dom";
import { FiArrowUpRight, FiHome, FiMap, FiBriefcase } from "react-icons/fi";
import { FaRegBuilding } from "react-icons/fa";
import { properties } from "../data/properties.js";
import { motion as Motion } from "framer-motion";
import { useEntranceMotion } from "../hooks/useEntranceMotion.js";

const MotionLink = Motion.create(Link);

const categories = [
  {
    name: "Casas",
    type: "house",
    Icon: FiHome,
    description: "Espacio para tu día a día",
  },
  {
    name: "Departamentos",
    type: "apartment",
    Icon: FaRegBuilding,
    description: "La ciudad, más cerca",
  },
  {
    name: "Terrenos",
    type: "land",
    Icon: FiMap,
    description: "Un lugar para proyectar",
  },
  {
    name: "Oficinas",
    type: "office",
    Icon: FiBriefcase,
    description: "Tu próximo espacio de trabajo",
  },
];

const PropertyCategories = () => {
  const entrance = useEntranceMotion();
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16" aria-labelledby="home-categories-title">
      <Motion.div {...entrance()} className="mb-7 flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="home-categories-title" className="text-lg font-semibold tracking-tight text-slate-900">¿Qué tienes en mente?</h2>
        <p className="text-xs leading-5 text-slate-500">Explora por tipo de propiedad</p>
      </Motion.div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-5 lg:grid-cols-4 lg:gap-8">
        {categories.map(({ name, type, Icon, description }, index) => (
          <MotionLink
            {...entrance(index)}
            key={type}
            to={`/search?type=${type}`}
            className="group min-w-0 border-b border-stone-300 pb-5 transition-colors hover:border-indigo-700"
          >
            <div className="mb-5 flex items-center justify-between text-slate-600 group-hover:text-indigo-700">
              <Icon size={25} strokeWidth={1.35} aria-hidden="true" />
              <FiArrowUpRight size={18} aria-hidden="true" />
            </div>
            <h3 className="wrap-break-word text-sm font-semibold tracking-tight text-slate-900 group-hover:text-indigo-700 sm:text-base">{name}</h3>
            <p className="mt-1 hidden text-xs leading-5 text-slate-500 sm:block">{description}</p>
            <p className="mt-3 text-xs text-slate-600">{properties.filter((property) => property.type === type).length} propiedades</p>
          </MotionLink>
        ))}
      </div>
    </section>
  );
};

export default PropertyCategories;
