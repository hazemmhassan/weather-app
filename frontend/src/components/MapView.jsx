import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's broken default icon paths when bundled with webpack/CRA
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl:       require('leaflet/dist/images/marker-icon.png'),
  shadowUrl:     require('leaflet/dist/images/marker-shadow.png'),
});

// Inner component that re-centres the map whenever coords change
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export default function MapView({ coords }) {
  if (!coords) return null;
  const { latitude: lat, longitude: lng, display_name } = coords;

  return (
    <section className="map-section">
      <h2>🗺️ Location Map</h2>
      <div className="map-wrapper">
        <MapContainer
          center={[lat, lng]}
          zoom={11}
          scrollWheelZoom={false}
          style={{ height: '420px', width: '100%', borderRadius: '12px' }}
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap lat={lat} lng={lng} />
          <Marker position={[lat, lng]}>
            <Popup maxWidth={260}>{display_name}</Popup>
          </Marker>
        </MapContainer>
      </div>
    </section>
  );
}
