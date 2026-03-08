import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";

import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import FitBounds from "./FitBounds";

const createPriceIcon = (price) =>
  L.divIcon({
    className: "price-marker-wrapper",
    html: `<div class="price-marker">$${(price / 1000000).toFixed(0)}M</div>`,
    iconSize: [60, 30],
    iconAnchor: [30, 30],
  });

const PropertiesMap = ({ properties }) => {
  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden">
      <MapContainer
        center={[-33.45, -70.66]}
        zoom={12}
        className="h-full w-full"
      >
        <FitBounds properties={properties} />

        <TileLayer
          attribution="© OpenStreetMap © CARTO"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MarkerClusterGroup>
          {properties.map((property) => (
            <Marker
              key={property.id}
              position={[property.lat, property.lng]}
              icon={createPriceIcon(property.price)}
            >
              <Popup>
                <div className="w-[200px]">
                  <img
                    src={property.images[0]}
                    className="w-full h-24 object-cover rounded"
                  />
                  <p className="font-semibold mt-2">{property.title}</p>
                  <p className="text-sm text-slate-500">{property.location}</p>
                  <p className="font-bold text-indigo-600">
                    ${property.price.toLocaleString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default PropertiesMap;
