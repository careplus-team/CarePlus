"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default marker icon in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom Icons using DivIcon (to render SVGs) for "Premium" look
const createCustomIcon = (type: 'ambulance' | 'patient') => {
  const isAmbulance = type === 'ambulance';
  const colorClass = isAmbulance ? 'bg-red-600' : 'bg-blue-600';
  const iconSvg = isAmbulance 
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M22 10.3c0 .8-.5 1.5-1.2 1.7"/><path d="M11 2v4"/><path d="M13 4H9"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

  return new L.DivIcon({
    className: 'custom-map-marker',
    html: `<div class="${colorClass} w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white transform -translate-x-1/2 -translate-y-1/2">
             ${iconSvg}
           </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20], // Center it
    popupAnchor: [0, -25]
  });
};

const ambulanceIcon = createCustomIcon('ambulance');
const patientIcon = createCustomIcon('patient');

interface LeafletMapProps {
  lat: number;
  lng: number;
  popupText?: string;
  className?: string;
  ambulanceLat?: number;
  ambulanceLng?: number;
  routeCoordinates?: [number, number][]; // Array of [lat, lng]
}

// Component to update map center when props change
function MapUpdater({ lat, lng, ambulanceLat, ambulanceLng, routeCoordinates }: { lat: number, lng: number, ambulanceLat?: number, ambulanceLng?: number, routeCoordinates?: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    // Priority: If there is a route, fit to route bounds
    if (routeCoordinates && routeCoordinates.length > 1) {
        const bounds = L.latLngBounds(routeCoordinates);
        map.fitBounds(bounds, { padding: [50, 50] });
    }
    // Else if ambulance is present, fit bounds to show both points
    else if (ambulanceLat && ambulanceLat !== 0 && ambulanceLng && ambulanceLng !== 0) {
        const bounds = L.latLngBounds([
            [lat, lng],
            [ambulanceLat, ambulanceLng]
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });
    } else {
        map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, ambulanceLat, ambulanceLng, routeCoordinates, map]);
  return null;
}

export default function LeafletMap({ lat, lng, popupText = "Location", className, ambulanceLat, ambulanceLng, routeCoordinates }: LeafletMapProps) {
  // Validate coordinates
  if (!lat || !lng) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className || "h-64 w-full rounded-lg"}`}>
        Waiting for location...
      </div>
    );
  }

  return (
    <div className={className || "h-64 w-full rounded-lg overflow-hidden z-0"}>
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User/Patient Marker */}
        <Marker position={[lat, lng]} icon={patientIcon}>
          <Popup>{popupText}</Popup>
        </Marker>

        {/* Ambulance Marker */}
        {ambulanceLat && ambulanceLng && (
            <Marker position={[ambulanceLat, ambulanceLng]} icon={ambulanceIcon}>
                <Popup className="font-bold text-red-600">🚑 Ambulance</Popup>
            </Marker>
        )}

        {/* Route Polyline (Uber-like path) */}
        {routeCoordinates && (
            <Polyline 
                key={routeCoordinates.map(c => c.join(',')).join('|')}
                positions={routeCoordinates} 
                pathOptions={{ color: 'blue', weight: 4, opacity: 0.7 }} 
            />
        )}

        <MapUpdater 
            lat={lat} 
            lng={lng} 
            ambulanceLat={ambulanceLat} 
            ambulanceLng={ambulanceLng} 
            routeCoordinates={routeCoordinates}
        />
      </MapContainer>
    </div>
  );
}
