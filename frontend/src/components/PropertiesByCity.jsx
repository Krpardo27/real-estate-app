const cities = [
  {
    name: "Santiago",
    properties: 320,
    image: "https://images.unsplash.com/photo-1547838642-4b6c9f3b1b07",
  },
  {
    name: "Valparaíso",
    properties: 140,
    image: "https://images.unsplash.com/photo-1567696911980-2c6c9b0a2d4d",
  },
  {
    name: "Concepción",
    properties: 90,
    image: "https://images.unsplash.com/photo-1505764706515-aa95265c5abc",
  },
  {
    name: "La Serena",
    properties: 70,
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21",
  },
];

const PropertiesByCity = () => {
  return (
    <section className="mx-auto px-4 sm:px-6 py-12">
      <h2 className="text-2xl font-bold mb-8">Explorar por ciudad</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cities.map((city) => (
          <article
            key={city.name}
            className="relative h-40 md:h-52 rounded-xl overflow-hidden group cursor-pointer"
          >
            {/* imagen */}
            <img
              src={city.image}
              alt={city.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-300"
            />

            {/* overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>

            {/* contenido */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h3 className="text-lg md:text-xl font-semibold">{city.name}</h3>

              <p className="text-sm opacity-90">
                {city.properties} propiedades
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default PropertiesByCity;
