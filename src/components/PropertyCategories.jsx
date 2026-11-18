import { Link } from "react-router-dom";
import PropertyImage from "./PropertyImage";
import { siteImages } from "../data/siteImages.js";

const categories = [
  {
    name: "Casas",
    type: "house",
    image: siteImages.categories.house,
  },
  {
    name: "Departamentos",
    type: "apartment",
    image: siteImages.categories.apartment,
  },
  {
    name: "Terrenos",
    type: "land",
    image: siteImages.categories.land,
  },
  {
    name: "Oficinas",
    type: "office",
    image: siteImages.categories.office,
  },
];

const PropertyCategories = () => {
  return (
    <section className="home-section" aria-labelledby="home-categories-title">
      <div className="mb-6">
        <h2 id="home-categories-title" className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">
          Explorar por tipo
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Cuatro formas de recorrer el catálogo de demostración.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            to={`/search?type=${cat.type}`}
            className="group relative isolate flex min-h-40 min-w-0 items-end overflow-hidden rounded-lg bg-slate-900 p-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600 sm:min-h-48 sm:p-5"
          >
            <PropertyImage
              src={cat.image}
              width={640}
              height={480}
              alt=""
              loading="lazy"
              sizes="(max-width: 767px) 50vw, (max-width: 1279px) 25vw, 300px"
              className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
            />
            <div className="absolute inset-0 -z-10 bg-slate-950/65 transition-colors group-hover:bg-slate-950/75" />
            <h3 className="min-w-0 wrap-break-word text-base font-semibold leading-snug text-white sm:text-lg">{cat.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PropertyCategories;
