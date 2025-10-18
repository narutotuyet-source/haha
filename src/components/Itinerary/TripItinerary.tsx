import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { Clock, DollarSign, Users, Trash2, Save } from 'lucide-react';

export interface ItineraryItem {
  id: string;
  name: string;
  address: string;
  category: string;
  estimated_cost: number;
  number_of_travelers: number;
  estimated_time_hours: number;
  latitude: number;
  longitude: number;
  order_index: number;
}

interface TripItineraryProps {
  items: ItineraryItem[];
  onReorder: (items: ItineraryItem[]) => void;
  onRemove: (id: string) => void;
  onSave: () => void;
}

export default function TripItinerary({ items, onReorder, onRemove, onSave }: TripItineraryProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const reorderedItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order_index: index,
      }));

      onReorder(reorderedItems);
    }
  };

  const totalCost = items.reduce(
    (sum, item) => sum + item.estimated_cost * item.number_of_travelers,
    0
  );
  const totalTime = items.reduce((sum, item) => sum + item.estimated_time_hours, 0);
  const totalTravelers = Math.max(...items.map((item) => item.number_of_travelers), 0);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Itinerary</h2>
          {items.length > 0 && (
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={18} />
              Save Trip
            </button>
          )}
        </div>

        {items.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <DollarSign size={16} />
                <span className="text-sm font-medium">Total Cost</span>
              </div>
              <p className="text-lg font-bold text-blue-900 mt-1">${totalCost.toFixed(2)}</p>
            </div>

            <div className="bg-green-50 p-2 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <Clock size={16} />
                <span className="text-sm font-medium">Total Time</span>
              </div>
              <p className="text-lg font-bold text-green-900 mt-1">{totalTime}h</p>
            </div>

            <div className="bg-orange-50 p-2 rounded-lg">
              <div className="flex items-center gap-2 text-orange-700">
                <Users size={16} />
                <span className="text-sm font-medium">Travelers</span>
              </div>
              <p className="text-lg font-bold text-orange-900 mt-1">{totalTravelers}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-6xl mb-4">📍</div>
            <p className="text-center">No destinations added yet</p>
            <p className="text-sm text-center mt-2">Search and add places to build your itinerary</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <SortableItem key={item.id} id={item.id}>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-1">{item.address}</p>

                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="flex items-center gap-1 text-gray-600">
                              <DollarSign size={14} />
                              ${(item.estimated_cost * item.number_of_travelers).toFixed(2)}
                            </span>
                            <span className="flex items-center gap-1 text-gray-600">
                              <Clock size={14} />
                              {item.estimated_time_hours}h
                            </span>
                            <span className="flex items-center gap-1 text-gray-600">
                              <Users size={14} />
                              {item.number_of_travelers}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 capitalize">
                              {item.category}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onRemove(item.id)}
                          className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove from trip"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
