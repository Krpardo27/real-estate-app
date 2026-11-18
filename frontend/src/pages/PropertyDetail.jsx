import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  IoLocationOutline,
  IoBedOutline,
  IoWaterOutline,
  IoSquareOutline,
  IoCallOutline,
} from "react-icons/io5";
import { BiLoaderAlt } from "react-icons/bi";
import { getPropertyById } from "../api/properties";
import Breadcrumbs from "../components/Breadcrumbs";
import { cld } from "../utils/cloudinary";

const PropertyDetail = () => {
  const { id } = useParams();
  const location = useLocation();

  const cityFromState = location.state?.city;
  const districtFromState = location.state?.district;

  const {
    data: property,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["property", id],
    queryFn: () => getPropertyById(id),
    enabled: !!id,
  });


  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        {" "}
        <BiLoaderAlt className="h-10 w-10 animate-spin text-blue-600" />{" "}
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="text-center mt-10">
        {" "}
        <p className="text-red-500 font-semibold">
          Propiedad no encontrada.{" "}
        </p>{" "}
      </div>
    );
  }

  const images = property.images || [];
  const city = cityFromState || property.city;
  const district = districtFromState || property.district;

  console.log(property.images)

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <Breadcrumbs
        items={[
          { label: city, href: `/search?city=${city}` },
          {
            label: district,
            href: `/search?city=${city}&district=${district}`,
          },
          { label: property.title },
        ]}
      />
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-6 gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
            {property.title}
          </h1>

          <div className="flex items-center text-slate-500 mt-2">
            <IoLocationOutline className="h-5 w-5 mr-1" />
            <span>{property.location}</span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">
            Precio de Venta
          </p>

          <p className="text-3xl font-black text-blue-600">
            ${property.price.toLocaleString("es-CL")}
          </p>
        </div>
      </div>
      {/* MOBILE gallery */}
      {/* MOBILE gallery */}
      <div className="lg:hidden flex justify-center gap-4 w-full overflow-x-auto snap-x snap-mandatory pb-4">
        {images.map((img, i) => (
          <img
            key={i}
            src={cld(img, 900)}
            alt={`${property.title} ${i + 1}`}
            className="snap-center w-[85%] h-80 shrink-0 object-cover rounded-xl"
          />
        ))}
      </div>

      {/* DESKTOP gallery */}
      <div className="hidden lg:grid grid-cols-4 gap-4 mb-10 h-[550px]">
        {/* MAIN image */}
        <div className="col-span-2 overflow-hidden rounded-2xl shadow-lg">
          <img
            src={cld(images[0], 1600)}
            alt={`${property.title} 1`}
            fetchpriority="high"
            loading="eager"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* middle column */}
        <div className="grid grid-rows-2 gap-4">
          <img
            src={cld(images[1] || images[0], 800)}
            alt={`${property.title} 2`}
            className="w-full h-full object-cover rounded-2xl shadow-sm"
          />

          <img
            src={cld(images[2] || images[0], 800)}
            alt={`${property.title} 3`}
            className="w-full h-full object-cover rounded-2xl shadow-sm"
          />
        </div>

        {/* right image */}
        <div className="overflow-hidden rounded-2xl shadow-lg">
          <img
            src={cld(images[3] || images[0], 800)}
            alt={`${property.title} 4`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* MAIN */}
        <div className="lg:col-span-2">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 border-b pb-8 mb-8">
            <div className="flex items-center justify-center gap-2 bg-slate-100 px-4 py-3 rounded-xl">
              <IoBedOutline className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-sm sm:text-base">
                {property.bedrooms} Dorm.
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 bg-slate-100 px-4 py-3 rounded-xl">
              <IoWaterOutline className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-sm sm:text-base">
                {property.bathrooms} Baños
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 bg-slate-100 px-4 py-3 rounded-xl">
              <IoSquareOutline className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-sm sm:text-base">
                {property.area} m²
              </span>
            </div>
          </div>

          {/* Description */}
          <section>
            <h3 className="text-2xl font-bold mb-4 text-slate-800">
              Descripción
            </h3>

            <p className="text-slate-600 leading-relaxed text-lg">
              {property.description}
            </p>
          </section>
        </div>

        {/* SIDEBAR */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 p-6 border border-slate-200 rounded-3xl shadow-xl bg-white">
            <h3 className="text-xl font-bold mb-6">
              ¿Te interesa esta propiedad?
            </h3>

            <div className="space-y-4">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-200">
                Contactar Agente
              </button>

              <button className="w-full flex items-center justify-center gap-2 border-2 border-slate-900 text-slate-900 font-bold py-4 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                <IoCallOutline className="h-5 w-5" />
                Llamar ahora
              </button>
            </div>

            <p className="text-center text-xs text-slate-400 mt-6">
              ID de referencia: {id.slice(-6).toUpperCase()}
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default PropertyDetail;
