import HeroSearch from "../components/HeroSearch";
import PropertyGrid from "../components/PropertyGrid";
import PropertyCategories from "../components/PropertyCategories";
import PropertiesByCity from "../components/PropertiesByCity";
import Seo from "../components/Seo";
import { Link } from "react-router-dom";
import { FiArrowUpRight, FiMapPin } from "react-icons/fi";
import PropertyImage from "../components/PropertyImage.jsx";
import { siteImages, cityImageSrcSets } from "../data/siteImages.js";

const Home = () => {
  return (
    <div className="bg-[#fcfbf8]">
      <Seo
        title="Catálogo demo de propiedades en Chile"
        description="Explora el catálogo de demostración de HomeEstate: casas, departamentos, terrenos y oficinas por región y comuna de Chile. Anuncios ficticios, sin transacciones."
      />
      <HeroSearch />
      <PropertyCategories />
      <div className="border-y border-stone-200 bg-white">
        <PropertyGrid />
      </div>
      <PropertiesByCity />
      <section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 sm:pb-14 lg:pb-16" aria-labelledby="home-map-title">
        <div className="grid overflow-hidden bg-[#eaece7] md:grid-cols-2">
          <div className="relative min-h-56 bg-stone-200 md:min-h-96">
            <PropertyImage src={siteImages.cities.Talca} srcSet={cityImageSrcSets.Talca} width={800} alt="" loading="lazy" sizes="(max-width: 767px) 100vw, 640px" className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute bottom-3 left-4 bg-white px-2 py-1 text-[10px] text-slate-600">Plaza de Talca · Fotografía de referencia</span>
          </div>
          <div className="flex flex-col items-start justify-center p-6 sm:p-10 lg:p-14">
            <FiMapPin size={25} strokeWidth={1.4} className="mb-5 text-indigo-800" aria-hidden="true" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 sm:text-[11px]">Otra forma de encontrar</p>
            <h2 id="home-map-title" className="mt-3 text-2xl font-medium leading-tight tracking-[-0.035em] text-slate-900 sm:text-[30px]">Primero el lugar.<br />Después, la propiedad.</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">Recorre el mapa, descubre dónde se agrupan las propiedades y abre las fichas de las zonas que te interesan.</p>
            <Link to="/map?filters=all" className="mt-6 inline-flex min-h-12 items-center justify-center gap-3 rounded-sm bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-800">Explorar el mapa <FiArrowUpRight size={17} aria-hidden="true" /></Link>
            <p className="mt-4 text-[11px] leading-5 text-slate-600">Ubicaciones aproximadas de un catálogo de demostración.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
