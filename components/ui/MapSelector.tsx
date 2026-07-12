"use client"
import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapSelectorProps {
  onLocationSelect: (lat: number, lon: number) => void;
  defaultLat?: number;
  defaultLon?: number;
}

function LocationMarker({ onSelect }: { onSelect: (lat: number, lon: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null)
  
  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      setPosition(e.latlng)
      onSelect(e.latlng.lat, e.latlng.lng)
    },
  })

  return position === null ? null : (
    <Marker position={position}></Marker>
  )
}

export default function MapSelector({ onLocationSelect, defaultLat = 40.7128, defaultLon = -74.0060 }: MapSelectorProps) {
  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden border z-10 relative">
      <MapContainer 
        center={[defaultLat, defaultLon]} 
        zoom={12} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onSelect={onLocationSelect} />
      </MapContainer>
    </div>
  )
}
