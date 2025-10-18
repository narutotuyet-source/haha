import { useState, useEffect } from 'react';
import { Map, ListChecks, BarChart3, Navigation2 } from 'lucide-react';
import InteractiveMap from './components/Map/InteractiveMap';
import PlaceSearch, { PlaceResult } from './components/Search/PlaceSearch';
import NearbyPlaces from './components/Search/NearbyPlaces';
import PlaceDetailsModal from './components/Modal/PlaceDetailsModal';
import TripItinerary, { ItineraryItem } from './components/Itinerary/TripItinerary';
import TripStatistics from './components/Dashboard/TripStatistics';
import { useGeolocation } from './hooks/useGeolocation';
import { supabase } from './lib/supabase';

type Tab = 'map' | 'itinerary' | 'statistics';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.006]);
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);

  const { latitude, longitude, error, loading } = useGeolocation();

  useEffect(() => {
    if (latitude && longitude) {
      setMapCenter([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handlePlaceSelect = (place: PlaceResult) => {
    setMapCenter([place.latitude, place.longitude]);
  };

  const handleSearchLocation = (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
  };

  const handleAddToTrip = (place: PlaceResult & { estimated_cost: number }) => {
    setSelectedPlace({ ...place });
    setIsModalOpen(true);
  };

  const handleModalAddToTrip = (
    place: PlaceResult & { estimated_cost: number },
    travelers: number,
    hours: number
  ) => {
    const newItem: ItineraryItem = {
      id: `${place.id}-${Date.now()}`,
      name: place.name,
      address: place.address,
      category: place.category,
      estimated_cost: place.estimated_cost,
      number_of_travelers: travelers,
      estimated_time_hours: hours,
      latitude: place.latitude,
      longitude: place.longitude,
      order_index: itineraryItems.length,
    };

    setItineraryItems([...itineraryItems, newItem]);
    setIsModalOpen(false);
  };

  const handleReorder = (reorderedItems: ItineraryItem[]) => {
    setItineraryItems(reorderedItems);
  };

  const handleRemove = (id: string) => {
    setItineraryItems(itineraryItems.filter((item) => item.id !== id));
  };

  const handleSaveTrip = async () => {
    try {
      if (!currentTripId) {
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .insert({
            title: `Trip to ${itineraryItems[0]?.name || 'Unknown'}`,
            description: 'Auto-generated trip',
            user_id: '00000000-0000-0000-0000-000000000000',
            budget: itineraryItems.reduce(
              (sum, item) => sum + item.estimated_cost * item.number_of_travelers,
              0
            ),
          })
          .select()
          .single();

        if (tripError) throw tripError;
        setCurrentTripId(tripData.id);

        const destinations = itineraryItems.map((item) => ({
          trip_id: tripData.id,
          name: item.name,
          address: item.address,
          latitude: item.latitude,
          longitude: item.longitude,
          category: item.category,
          estimated_cost: item.estimated_cost,
          number_of_travelers: item.number_of_travelers,
          estimated_time_hours: item.estimated_time_hours,
          order_index: item.order_index,
        }));

        const { error: destError } = await supabase.from('destinations').insert(destinations);

        if (destError) throw destError;

        alert('Trip saved successfully!');
      } else {
        alert('Trip already saved!');
      }
    } catch (error) {
      console.error('Error saving trip:', error);
      alert('Note: Trip saving requires authentication. Your trip is stored locally for now.');
    }
  };

  const handleUseMyLocation = () => {
    if (latitude && longitude) {
      setMapCenter([latitude, longitude]);
    }
  };

  const markers = itineraryItems.map((item) => ({
    id: item.id,
    position: [item.latitude, item.longitude] as [number, number],
    name: item.name,
    category: item.category,
  }));

  const tabs = [
    { id: 'map' as Tab, label: 'Map', icon: Map },
    { id: 'itinerary' as Tab, label: 'Itinerary', icon: ListChecks },
    { id: 'statistics' as Tab, label: 'Statistics', icon: BarChart3 },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Map className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">TravelMap Planner</h1>
                <p className="text-sm text-gray-600">Plan your perfect journey</p>
              </div>
            </div>

            {!loading && latitude && longitude && (
              <button
                onClick={handleUseMyLocation}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Navigation2 size={18} />
                Use My Location
              </button>
            )}
          </div>
        </div>

        <div className="px-6 pb-4">
          <div className="flex gap-2 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {activeTab === 'map' && (
          <div className="h-full flex">
            <div className="w-96 border-r border-gray-200 bg-white flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <PlaceSearch
                  onPlaceSelect={handlePlaceSelect}
                  onSearchLocation={handleSearchLocation}
                />
              </div>
              <div className="flex-1 overflow-hidden">
                <NearbyPlaces
                  latitude={mapCenter[0]}
                  longitude={mapCenter[1]}
                  onAddToTrip={handleAddToTrip}
                />
              </div>
            </div>

            <div className="flex-1">
              <InteractiveMap center={mapCenter} markers={markers} />
            </div>
          </div>
        )}

        {activeTab === 'itinerary' && (
          <div className="h-full max-w-4xl mx-auto">
            <TripItinerary
              items={itineraryItems}
              onReorder={handleReorder}
              onRemove={handleRemove}
              onSave={handleSaveTrip}
            />
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="h-full">
            <TripStatistics items={itineraryItems} />
          </div>
        )}
      </main>

      <PlaceDetailsModal
        place={
          selectedPlace
            ? {
                ...selectedPlace,
                estimated_cost: (selectedPlace as any).estimated_cost || 0,
              }
            : null
        }
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToTrip={handleModalAddToTrip}
      />
    </div>
  );
}

export default App;
