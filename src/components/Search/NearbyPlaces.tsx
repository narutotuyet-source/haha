import { useState, useEffect } from 'react';
import { MapPin, Star, Clock, DollarSign, Plus, Loader } from 'lucide-react';
import type { PlaceResult } from './PlaceSearch';

interface NearbyPlacesProps {
  latitude: number;
  longitude: number;
  onAddToTrip: (place: PlaceResult & { estimated_cost: number }) => void;
}

export default function NearbyPlaces({ latitude, longitude, onAddToTrip }: NearbyPlacesProps) {
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'attraction' | 'restaurant' | 'hotel'>('all');

  useEffect(() => {
    fetchNearbyPlaces();
  }, [latitude, longitude, filter]);

  const fetchNearbyPlaces = async () => {
    setLoading(true);
    try {
      const radius = 5000;
      const amenityTypes: Record<string, string> = {
        attraction: 'tourism',
        restaurant: 'amenity=restaurant',
        hotel: 'tourism=hotel',
      };

      const query =
        filter === 'all'
          ? `[out:json];(node["tourism"](around:${radius},${latitude},${longitude});node["amenity"="restaurant"](around:${radius},${latitude},${longitude}););out body;`
          : `[out:json];node["${amenityTypes[filter]}"](around:${radius},${latitude},${longitude});out body;`;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
      });

      const data = await response.json();

      const nearbyPlaces: PlaceResult[] = data.elements
        .filter((item: any) => item.tags && item.tags.name)
        .slice(0, 10)
        .map((item: any) => ({
          id: item.id.toString(),
          name: item.tags.name,
          address: `${item.tags['addr:street'] || ''} ${item.tags['addr:housenumber'] || ''}`.trim() || 'Address not available',
          latitude: item.lat,
          longitude: item.lon,
          category: item.tags.tourism || item.tags.amenity || 'attraction',
          rating: item.tags['stars'] ? parseFloat(item.tags['stars']) : undefined,
        }));

      setPlaces(nearbyPlaces);
    } catch (error) {
      console.error('Error fetching nearby places:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstimatedCost = (category: string) => {
    const costs: Record<string, number> = {
      restaurant: 25,
      hotel: 150,
      attraction: 15,
      museum: 20,
      park: 0,
    };
    return costs[category] || 10;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Nearby Places</h2>
        <div className="flex gap-2">
          {(['all', 'attraction', 'restaurant', 'hotel'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-blue-600" size={32} />
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MapPin className="mx-auto mb-2 text-gray-400" size={32} />
            <p>No places found nearby</p>
          </div>
        ) : (
          places.map((place) => {
            const estimatedCost = getEstimatedCost(place.category);
            return (
              <div
                key={place.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{place.name}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-1">{place.address}</p>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                        <MapPin size={14} />
                        <span className="capitalize">{place.category}</span>
                      </span>

                      {place.rating && (
                        <span className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                          <Star size={14} className="text-yellow-500" />
                          <span>{place.rating}</span>
                        </span>
                      )}

                      <span className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
                        <DollarSign size={14} className="text-green-600" />
                        <span>${estimatedCost}</span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onAddToTrip({ ...place, estimated_cost: estimatedCost })}
                    className="flex-shrink-0 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Add to trip"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
