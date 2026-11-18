import { useId } from "react";
import PropertyImage from "./PropertyImage";
import PropertySearchForm from "./property-search/PropertySearchForm.jsx";
import { siteImages } from "../data/siteImages.js";

const HeroSearch = () => {
  const id = useId();

  return (
    <section aria-labelledby={`${id}-title`} className="relative isolate w-full max-w-none px-0 py-12 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-slate-900">
        <PropertyImage
          src={siteImages.hero}
          width={1440}
          quality={60}
          height={960}
          alt=""
          fetchPriority="high"
          loading="eager"
          sizes="100vw"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/70" />
      </div>

      <div className="page-container relative">
        <div className="max-w-2xl text-white">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest">HomeEstate · Catálogo demo</p>
          <h1 id={`${id}-title`} className="text-[32px] font-semibold leading-tight tracking-tight sm:text-[40px] lg:text-5xl">
            Explora propiedades en Chile
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white sm:text-lg">
            Busca por región, comuna, tipo de propiedad y presupuesto.
          </p>
        </div>

        <PropertySearchForm />
        <p className="mt-4 text-xs leading-5 text-white">Imágenes ilustrativas. Anuncios ficticios, sin transacciones.</p>
      </div>
    </section>
  );
};

export default HeroSearch;
