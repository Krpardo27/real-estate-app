import { Link } from "react-router-dom";
import { cities } from "../data/cities";
import PropertyImage from "./PropertyImage";

const PropertiesByCity = () => {
  return (
    <section id="ciudades" className="home-section" aria-labelledby="home-cities-title">
      <div className="mb-6">
        <h2 id="home-cities-title" className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">
          Explorar por ciudad
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Ciudades con anuncios en este catálogo demo. Imágenes ilustrativas.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {cities.map((city, index) => (
          <Link
            key={city.name}
            to={`/search?city=${encodeURIComponent(city.name)}`}
            className="group relative isolate flex min-h-44 min-w-0 flex-col justify-end overflow-hidden rounded-lg bg-slate-900 p-3 last:col-span-2 lg:last:col-span-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600 sm:min-h-52 sm:p-5"
          >
            <PropertyImage
              src={city.image}
              width={640}
              height={480}
              alt=""
              loading="lazy"
              sizes={index === cities.length - 1 ? "(max-width: 1023px) 100vw, 250px" : "(max-width: 1023px) 50vw, 250px"}
              className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
            />
            <div className="absolute inset-0 -z-10 bg-slate-950/65 transition-colors group-hover:bg-slate-950/75" />
            <h3 className="wrap-break-word text-base font-semibold leading-snug text-white sm:text-lg">{city.name}</h3>
            <p className="mt-1 text-xs leading-5 text-white sm:text-sm">
              {city.properties.toLocaleString("es-CL")} {city.properties === 1 ? "propiedad demo" : "propiedades demo"}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PropertiesByCity;
