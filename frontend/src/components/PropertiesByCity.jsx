import { Link } from "react-router-dom";
import { cities } from "../data/cities";

const PropertiesByCity = () => {
  return (
    <section className="mx-auto py-12">
      <h2 className="text-2xl font-bold mb-8">Explorar por ciudad</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cities.map((city) => (
          <Link
            key={city.name}
            to={`/search?city=${encodeURIComponent(city.name)}`}
            className="relative h-40 md:h-52 rounded-xl overflow-hidden group cursor-pointer"
          >
            <img
              src={city.image}
              alt={city.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-300"
            />

            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h3 className="text-lg md:text-xl font-semibold">{city.name}</h3>

              <p className="text-sm opacity-90">
                {city.properties} propiedades
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PropertiesByCity;
