
import { useLoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import { useState } from "react";
import { Input } from "./input";

export function LocationPicker({ onLocationSelect }: { 
  onLocationSelect: (location: { lat: number; lng: number }) => void 
}) {
  const [location, setLocation] = useState({ lat: 25.5941, lng: 85.1376 }); // Bihar coordinates
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || ""
  });

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <Input 
        type="text" 
        placeholder="Search location..."
        className="w-full"
      />
      <div className="h-[300px] rounded-lg overflow-hidden">
        <GoogleMap
          zoom={10}
          center={location}
          mapContainerClassName="w-full h-full"
        >
          <Marker position={location} />
        </GoogleMap>
      </div>
    </div>
  );
}
