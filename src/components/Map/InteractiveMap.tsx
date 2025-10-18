import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    position: [number, number];
    name: string;
    category?: string;
  }>;
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerClick?: (id: string) => void;
}

function MapClickHandler({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!onClick) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      onClick(e.latlng.lat, e.latlng.lng);
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onClick]);

  return null;
}

function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

export default function InteractiveMap({
  center,
  zoom = 13,
  markers = [],
  onMapClick,
  onMarkerClick,
}: MapProps) {
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'restaurant':
        return '#ef4444';
      case 'hotel':
        return '#3b82f6';
      case 'attraction':
        return '#10b981';
      default:
        return '#6366f1';
    }
  };

  const createCustomIcon = (category?: string) => {
    const color = getCategoryColor(category);
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg shadow-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onClick={onMapClick} />
      <MapCenterUpdater center={center} />

      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          icon={createCustomIcon(marker.category)}
          eventHandlers={{
            click: () => onMarkerClick?.(marker.id),
          }}
        >
          <Popup>
            <div className="text-sm">
              <h3 className="font-semibold">{marker.name}</h3>
              {marker.category && (
                <p className="text-gray-600 capitalize">{marker.category}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
