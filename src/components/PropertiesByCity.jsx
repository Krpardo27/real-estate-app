import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";
import { cities } from "../data/cities";
import PropertyImage from "./PropertyImage";
import { cityImageCredits } from "../data/siteImages.js";
import { motion as Motion } from "framer-motion";
import { useEntranceMotion } from "../hooks/useEntranceMotion.js";

const MotionLink = Motion.create(Link);

const PropertiesByCity = () => {
  const entrance = useEntranceMotion();
  return (
    <section
      id="ciudades"
      className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16"
      aria-labelledby="home-cities-title"
    >
      <Motion.div {...entrance()} className="mb-8 flex flex-col gap-5 sm:mb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 sm:text-[11px]">El lugar también importa</p>
          <h2 id="home-cities-title" className="mt-3 text-2xl font-medium leading-tight tracking-[-0.035em] text-slate-900 sm:text-[30px]">Una ciudad para cada búsqueda</h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-slate-600">De la vida urbana a un entorno más tranquilo. Explora las cinco ciudades del catálogo.</p>
      </Motion.div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:gap-x-6 lg:grid-cols-[1.2fr_1fr_1fr] lg:gap-x-7">
        {cities.map((city, index) => (
          <MotionLink
            {...entrance(index)}
            key={city.name}
            to={`/search?city=${encodeURIComponent(city.name)}`}
            className={`group min-w-0 ${index === 0 ? "col-span-2 lg:col-span-1 lg:row-span-2 lg:flex lg:flex-col" : ""}`}
          >
            <div className={`relative overflow-hidden bg-stone-200 ${index === 0 ? "aspect-16/10 lg:aspect-auto lg:min-h-80 lg:flex-1" : "aspect-4/3 sm:aspect-16/10"}`}>
            <PropertyImage
              src={city.image}
              srcSet={city.imageSet}
              width={index === 0 ? 800 : 640}
              height={index === 0 ? 960 : 480}
              alt=""
              loading="lazy"
              sizes={
                index === 0
                  ? "(max-width: 1023px) 100vw, 440px"
                  : "(max-width: 1023px) 50vw, 380px"
              }
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
            />
            </div>
            <div className="flex items-center justify-between gap-2 pt-4">
              <h3 className="wrap-break-word text-sm font-semibold tracking-tight text-slate-900 group-hover:text-indigo-700 sm:text-lg">{city.name}</h3>
              <FiArrowUpRight size={18} className="shrink-0 text-slate-500 group-hover:text-indigo-700" aria-hidden="true" />
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {city.properties.toLocaleString("es-CL")}{" "}
              {city.properties === 1 && "propiedad demo"}
              {city.properties !== 1 && "propiedades demo"}
            </p>
          </MotionLink>
        ))}
      </div>
      <div className="mt-7 border-t border-stone-200 pt-4 text-[11px] leading-5 text-slate-600">
        <p>Fotografías de las ciudades. Los anuncios y las ubicaciones de las propiedades son ilustrativos.</p>
        <details className="mt-1">
          <summary className="w-fit cursor-pointer py-2 font-medium underline underline-offset-4 hover:text-indigo-800">Créditos de las fotografías</summary>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {cityImageCredits.map(({ city, author, source, license, licenseUrl }) => (
              <li key={city}>
                <a href={source} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-indigo-800">{city}: {author}</a>
                {" · "}{licenseUrl ? <a href={licenseUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-indigo-800">{license}</a> : license}
              </li>
            ))}
          </ul>
          <p className="mt-3">Fuente: Wikimedia Commons. Versiones WebP redimensionadas y comprimidas bajo las mismas licencias; el encuadre se adapta al dispositivo.</p>
        </details>
      </div>
    </section>
  );
};

export default PropertiesByCity;
