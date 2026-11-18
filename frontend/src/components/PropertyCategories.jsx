import { Link } from "react-router-dom";

const categories = [
  {
    name: "Casas",
    type: "house",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  },
  {
    name: "Departamentos",
    type: "apartment",
    image: "https://images.unsplash.com/photo-1501183638710-841dd1904471",
  },
  {
    name: "Terrenos",
    type: "land",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
  },
  {
    name: "Oficinas",
    type: "office",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
  },
];

const PropertyCategories = () => {
  return (
    <section>
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="h-6 w-[3px] bg-indigo-600 rounded-full"></span>

          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
            Explorar propiedades
          </h2>
        </div>

        <p className="text-gray-500 text-sm">
          Encuentra casas, departamentos y oportunidades inmobiliarias en
          distintas zonas.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            to={`/search?type=${cat.type}`}
            className="relative h-36 md:h-44 rounded-xl overflow-hidden group cursor-pointer"
          >
            <img
              src={cat.image}
              alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-300"
            />

            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>

            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-white text-lg md:text-xl font-semibold">
                {cat.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PropertyCategories;
