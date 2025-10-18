import { useState } from 'react';
import { Search, MapPin, Loader } from 'lucide-react';

export interface PlaceResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  rating?: number;
  photos?: string[];
}

interface PlaceSearchProps {
  onPlaceSelect: (place: PlaceResult) => void;
  onSearchLocation: (lat: number, lng: number) => void;
}

export default function PlaceSearch({ onPlaceSelect, onSearchLocation }: PlaceSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<PlaceResult[]>([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5`
      );
      const data = await response.json();

      const places: PlaceResult[] = data.map((item: any) => ({
        id: item.place_id.toString(),
        name: item.display_name.split(',')[0],
        address: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        category: item.type || 'attraction',
      }));

      setResults(places);

      if (places.length > 0) {
        onSearchLocation(places[0].latitude, places[0].longitude);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for a destination..."
          className="w-full px-4 py-3 pl-12 pr-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="absolute right-2 top-2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {isSearching ? (
            <Loader className="animate-spin" size={18} />
          ) : (
            'Search'
          )}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {results.map((place) => (
            <button
              key={place.id}
              onClick={() => {
                onPlaceSelect(place);
                setResults([]);
                setSearchQuery('');
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-3">
                <MapPin className="text-blue-600 mt-1 flex-shrink-0" size={18} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{place.name}</h3>
                  <p className="text-sm text-gray-600 truncate">{place.address}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
