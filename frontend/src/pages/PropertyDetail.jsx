import { useParams } from "react-router-dom";

const PropertyDetail = () => {
  const { id } = useParams();

  return (
    <div>
      <h2 className="text-2xl font-bold">Detalle propiedad {id}</h2>
    </div>
  );
};

export default PropertyDetail;
