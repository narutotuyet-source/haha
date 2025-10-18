import { X, MapPin, DollarSign, Clock, Users, Star, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

interface PlaceDetails {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  estimated_cost: number;
  rating?: number;
  photos?: string[];
  description?: string;
  opening_hours?: string;
}

interface PlaceDetailsModalProps {
  place: PlaceDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToTrip: (place: PlaceDetails, travelers: number, hours: number) => void;
}

export default function PlaceDetailsModal({
  place,
  isOpen,
  onClose,
  onAddToTrip,
}: PlaceDetailsModalProps) {
  const [travelers, setTravelers] = useState(1);
  const [hours, setHours] = useState(2);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  if (!isOpen || !place) return null;

  const totalCost = place.estimated_cost * travelers;
  const samplePhotos = [
    'https://images.pexels.com/photos/2549018/pexels-photo-2549018.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1268871/pexels-photo-1268871.jpeg?auto=compress&cs=tinysrgb&w=800',
  ];

  const photos = place.photos && place.photos.length > 0 ? place.photos : samplePhotos;

  const handleAdd = () => {
    onAddToTrip(place, travelers, hours);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="relative h-80 bg-gray-200">
          <img
            src={photos[selectedPhoto]}
            alt={place.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <X size={24} />
          </button>

          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {photos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPhoto(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === selectedPhoto ? 'bg-white w-8' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{place.name}</h2>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={18} />
              <span>{place.address}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cost per person</p>
                <p className="text-lg font-semibold text-gray-900">${place.estimated_cost}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{place.category}</p>
              </div>
            </div>

            {place.rating && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="text-yellow-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="text-lg font-semibold text-gray-900">{place.rating} / 5</p>
                </div>
              </div>
            )}

            {place.opening_hours && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="text-orange-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hours</p>
                  <p className="text-sm font-semibold text-gray-900">{place.opening_hours}</p>
                </div>
              </div>
            )}
          </div>

          {place.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-600 leading-relaxed">{place.description}</p>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add to Your Trip</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline mr-1" size={16} />
                  Number of Travelers
                </label>
                <input
                  type="number"
                  min="1"
                  value={travelers}
                  onChange={(e) => setTravelers(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline mr-1" size={16} />
                  Estimated Time (hours)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={hours}
                  onChange={(e) => setHours(Math.max(0.5, parseFloat(e.target.value) || 1))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Total Estimated Cost:</span>
                  <span className="text-2xl font-bold text-blue-600">${totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add to Trip
          </button>
        </div>
      </div>
    </div>
  );
}
