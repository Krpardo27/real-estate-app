import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Link } from "react-router-dom";
import L from "leaflet";

import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";

import FitBounds from "./FitBounds";

const createPriceIcon = (price) =>
  L.divIcon({
    className: "price-marker-wrapper",
    html: `<div class="price-marker">$${(price / 1000000).toFixed(0)}M</div>`,
    iconSize: [70, 32],
    iconAnchor: [35, 32],
  });

const PropertiesMap = ({ properties }) => {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-md">

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
                <Link to={`/property/${property.id}`}>

                  <div className="w-[220px]">

                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-28 object-cover rounded-lg"
                    />

                    <div className="mt-2">
                      <p className="font-semibold text-sm">
                        {property.title}
                      </p>

                      <p className="text-xs text-slate-500">
                        {property.location}
                      </p>

                      <p className="font-bold text-indigo-600 mt-1">
                        ${property.price.toLocaleString()}
                      </p>
                    </div>

                  </div>

                </Link>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>

      </MapContainer>

    </div>
  );
};

export default PropertiesMap;