import { FiSearch } from "react-icons/fi";

const HeroSearch = () => {
  return (
    <section className="relative h-[420px] flex items-center justify-center">
      {/* background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa')",
        }}
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
    </section>
  );
};

export default HeroSearch;
