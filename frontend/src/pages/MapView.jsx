import { useSearchParams } from "react-router-dom";
import { properties } from "../data/properties";
import PropertiesMap from "../components/map/PropertiesMap";
import FiltersSidebar from "../components/FiltersSidebar";

const MapView = () => {
  const [searchParams] = useSearchParams();

  const region = searchParams.get("region")
    ? Number(searchParams.get("region"))
    : null;

  const district = searchParams.get("district");
  const city = searchParams.get("city");

  const price = searchParams.get("price")
    ? Number(searchParams.get("price"))
    : null;

  const bedrooms = searchParams.get("bedrooms")
    ? Number(searchParams.get("bedrooms"))
    : null;

  const bathrooms = searchParams.get("bathrooms")
    ? Number(searchParams.get("bathrooms"))
    : null;

  const area = searchParams.get("area")
    ? Number(searchParams.get("area"))
    : null;

  const filtered = properties.filter((p) => {
    if (region && p.region !== region) return false;
    if (city && p.city !== city) return false;
    if (district && p.district !== district) return false;

    if (price && p.price > price) return false;
    if (bedrooms && p.bedrooms < bedrooms) return false;
    if (bathrooms && p.bathrooms < bathrooms) return false;
    if (area && p.area < area) return false;

    return true;
  });

  console.log({
    region,
    district,
    price,
    bedrooms,
    filtered,
  });

  return (
    <main className="w-full h-[calc(100vh-80px)] flex">
      <div className="w-[320px] p-4 overflow-y-auto">
        <FiltersSidebar />
      </div>

      <div className="flex-1 p-4">
        <PropertiesMap properties={filtered} />
      </div>
    </main>
  );
};

export default MapView;
