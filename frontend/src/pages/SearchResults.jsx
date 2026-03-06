import { useSearchParams } from "react-router-dom";
import { properties } from "../data/properties";
import PropertyCard from "../components/PropertyCard";
import Breadcrumbs from "../components/Breadcrumbs";

const SearchResults = () => {
  const [searchParams] = useSearchParams();

  const city = searchParams.get("city");

  const filtered = properties.filter(
    (p) => p.city?.toLowerCase() === city?.toLowerCase(),
  );

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <Breadcrumbs items={[{ label: city }]} />
      <h1 className="text-3xl font-bold mb-8">Propiedades en {city}</h1>

      {filtered.length === 0 && (
        <p className="text-slate-500">
          No se encontraron propiedades en esta ciudad.
        </p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </main>
  );
};

export default SearchResults;
