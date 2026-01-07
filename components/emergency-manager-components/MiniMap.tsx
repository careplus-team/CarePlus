"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in Next.js/Webpack
const icon = L.icon({
  iconUrl: "/images/marker-icon.png",
  shadowUrl: "/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
}); 
// Fallback if images aren't locally available, uses CDN
const defaultIcon = L.icon({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Component to recenter map when props change
function RecenterAutomatically({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

interface MiniMapProps {
  lat: number;
  lng: number;
}

const MiniMap = ({ lat, lng }: MiniMapProps) => {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={defaultIcon}>
        <Popup>
          Request Location
        </Popup>
      </Marker>
      <RecenterAutomatically lat={lat} lng={lng} />
    </MapContainer>
  );
};

export default MiniMap;
