"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationMarker({ setLocation, setAddress }) {
  const [position, setPosition] = useState(null);

  const map = useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      setLocation({ lat, lng });

      // Reverse geocoding
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        const data = await res.json();
        console.log("Nominatim response:", data);
        if (data && data.display_name) {
          setAddress(data.display_name);
        } else {
          setAddress("Alamat tidak tersedia untuk lokasi ini");
        }
      } catch (err) {
        console.error("Reverse geocoding error:", err);
        setAddress("Gagal mengambil alamat (cek koneksi atau CORS)");
      }
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Lokasi laporan dipilih di sini</Popup>
    </Marker>
  );
}

export default function MapWithMarker({ center, setLocation, setAddress }) {
  return (
    <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker setLocation={setLocation} setAddress={setAddress} />
    </MapContainer>
  );
}