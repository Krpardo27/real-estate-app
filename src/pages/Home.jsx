import HeroSearch from "../components/HeroSearch";
import PropertyGrid from "../components/PropertyGrid";
import PropertyCategories from "../components/PropertyCategories";
import PropertiesByCity from "../components/PropertiesByCity";
import Seo from "../components/Seo";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <>
      <Seo
        title="Catálogo demo de propiedades en Chile"
        description="Explora el catálogo de demostración de HomeEstate: casas, departamentos, terrenos y oficinas por región y comuna de Chile. Anuncios ficticios, sin transacciones."
      />
      <HeroSearch />
      <PropertyCategories />
      <PropertiesByCity />
      <div className="border-t border-slate-200 bg-slate-50">
        <PropertyGrid />
      </div>
      <section className="home-section border-t border-slate-200" aria-labelledby="home-map-title">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 id="home-map-title" className="text-2xl font-semibold tracking-tight text-slate-900">Empieza por la ubicación</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Consulta las propiedades en el mapa y revisa las fichas de cada zona. Las ubicaciones del catálogo demo son aproximadas.</p>
          </div>
          <Link to="/map" className="button-primary shrink-0">Explorar el mapa</Link>
        </div>
      </section>
    </>
  );
};

export default Home;
