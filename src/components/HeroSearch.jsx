import { useId } from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { FiArrowDown, FiMapPin } from "react-icons/fi";
import PropertyImage from "./PropertyImage";
import PropertySearchForm from "./property-search/PropertySearchForm.jsx";
import { siteImages } from "../data/siteImages.js";
import { properties } from "../data/properties.js";
import { cities } from "../data/cities.js";
import { FALLBACK_IMAGE } from "../utils/images.js";

const HeroSearch = () => {
  const id = useId();
  const reducedMotion = useReducedMotion();
  const reveal = (delay = 0, distance = 10) => ({
    initial: reducedMotion ? false : { opacity: 0.9, y: distance },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reducedMotion ? 0 : 0.45, delay: reducedMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] },
  });

  return (
    <section aria-labelledby={`${id}-title`} className="border-b border-stone-200 bg-[#f3f2ee]">
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-6 sm:px-6 sm:pt-10 lg:pt-8">
        <div className="grid min-w-0 items-center gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
          <div className="py-2 sm:py-5 lg:pb-16">
            <Motion.p {...reveal(0, 6)} className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 sm:text-[11px]">Una búsqueda, muchas posibilidades</Motion.p>
            <Motion.h1 {...reveal(0.04)} id={`${id}-title`} className="mt-5 max-w-lg text-[32px] font-medium leading-[1.16] tracking-[-0.04em] text-slate-900 sm:text-[42px] lg:text-[46px]">
              Explora propiedades en Chile
            </Motion.h1>
            <Motion.p {...reveal(0.1, 8)} className="mt-5 max-w-md text-sm leading-7 text-slate-600 sm:text-base">
              Busca casas, departamentos y terrenos por ubicación y presupuesto.
              Compara tus opciones y guarda las que te interesen.
            </Motion.p>
            <a href="#propiedades" className="mt-6 hidden min-h-11 items-center gap-3 text-xs font-semibold text-indigo-800 underline decoration-indigo-300 underline-offset-8 transition-colors hover:text-indigo-950 hover:decoration-indigo-800 sm:inline-flex sm:text-sm">
              Descubre la selección <FiArrowDown size={16} aria-hidden="true" />
            </a>
          </div>
          <Motion.figure {...reveal(0.06, 12)} className="relative m-0 hidden overflow-hidden bg-stone-200 sm:block lg:mb-12">
            <picture>
              <source media="(max-width: 639px)" srcSet={FALLBACK_IMAGE} />
              <PropertyImage
                src={siteImages.hero}
                width={1440}
                quality={60}
                height={960}
                alt=""
                fetchPriority="high"
                loading="eager"
                sizes="(min-width: 1280px) 681px, (min-width: 1024px) 55vw, calc(100vw - 48px)"
                className="h-72 w-full object-cover lg:h-105"
              />
            </picture>
            <figcaption className="absolute right-0 bottom-0 flex items-center gap-2 bg-white px-4 py-3 text-[11px] font-medium text-slate-700">
              <FiMapPin size={14} aria-hidden="true" /> Espacios para inspirarte · Imagen ilustrativa
            </figcaption>
          </Motion.figure>
        </div>
        <PropertySearchForm />
        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[11px] leading-5 text-slate-600 sm:text-xs">
          <Motion.p {...reveal(0.14, 4)}><strong className="font-semibold text-slate-800">{properties.length.toLocaleString("es-CL")} propiedades</strong> para explorar en {cities.length} ciudades</Motion.p>
          <Motion.p {...reveal(0.16, 4)}>Catálogo demo · Anuncios ficticios, sin transacciones.</Motion.p>
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
