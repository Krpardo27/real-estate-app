import { FiSearch } from "react-icons/fi";
import { cld } from "../utils/cloudinary.js";

const HeroSearch = () => {
  return (
    <div className="relative h-[620px] flex items-center justify-center">
      <img
  src={cld(
    "real-estate/hero-house/photo-1560518883-ce09059eeffa_b4up0m",
    1600
  )}
  alt="Casas en venta"
  fetchpriority="high"
  loading="eager"
  width="1600"
  height="800"
  className="absolute inset-0 w-full h-full object-cover"
/>

      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative text-center text-white max-w-3xl px-6">
        <h1 className="text-4xl font-bold mb-4">Encuentra tu próximo hogar</h1>

        <p className="mb-6 text-lg opacity-90">
          Casas y departamentos en todo Chile
        </p>

        <div className="bg-white rounded-xl p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 shadow-lg">
          <input
            placeholder="Ciudad"
            className="border rounded-lg px-3 py-2 text-sm text-black"
          />

          <select className="border rounded-lg px-3 py-2 text-sm text-black">
            <option>Tipo</option>
            <option>Casa</option>
            <option>Departamento</option>
          </select>

          <select className="border rounded-lg px-3 py-2 text-sm text-black">
            <option>Precio</option>
            <option>50M - 100M</option>
            <option>100M - 200M</option>
          </select>

          <button className="bg-indigo-600 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2">
            <FiSearch />
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSearch;
