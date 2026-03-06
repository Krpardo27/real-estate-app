const categories = [
  {
    name: "Casas",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  },
  {
    name: "Departamentos",
    image: "https://images.unsplash.com/photo-1501183638710-841dd1904471",
  },
  {
    name: "Terrenos",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
  },
  {
    name: "Oficinas",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
  },
];

const PropertyCategories = () => {
  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold mb-8">Explorar propiedades</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <article
            key={cat.name}
            className="relative h-36 md:h-44 rounded-xl overflow-hidden group cursor-pointer"
          >
            {/* image */}
            <img
              src={cat.image}
              alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-300"
            />

            {/* overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>

            {/* title */}
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-white text-lg md:text-xl font-semibold">
                {cat.name}
              </h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default PropertyCategories;
