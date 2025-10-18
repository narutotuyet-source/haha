import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { DollarSign, Clock, TrendingUp, MapPin } from 'lucide-react';
import type { ItineraryItem } from '../Itinerary/TripItinerary';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface TripStatisticsProps {
  items: ItineraryItem[];
}

export default function TripStatistics({ items }: TripStatisticsProps) {
  const categoryData = items.reduce((acc, item) => {
    const category = item.category;
    const cost = item.estimated_cost * item.number_of_travelers;
    acc[category] = (acc[category] || 0) + cost;
    return acc;
  }, {} as Record<string, number>);

  const pieData = {
    labels: Object.keys(categoryData).map((cat) => cat.charAt(0).toUpperCase() + cat.slice(1)),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: items.map((item, index) => `Stop ${index + 1}`),
    datasets: [
      {
        label: 'Cost ($)',
        data: items.map((item) => item.estimated_cost * item.number_of_travelers),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
    ],
  };

  const totalCost = items.reduce(
    (sum, item) => sum + item.estimated_cost * item.number_of_travelers,
    0
  );
  const totalTime = items.reduce((sum, item) => sum + item.estimated_time_hours, 0);
  const avgCostPerStop = items.length > 0 ? totalCost / items.length : 0;

  const stats = [
    {
      title: 'Total Budget',
      value: `$${totalCost.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Duration',
      value: `${totalTime}h`,
      icon: Clock,
      color: 'bg-green-500',
    },
    {
      title: 'Avg Cost/Stop',
      value: `$${avgCostPerStop.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
    {
      title: 'Total Stops',
      value: items.length,
      icon: MapPin,
      color: 'bg-purple-500',
    },
  ];

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-center text-lg">No statistics available</p>
        <p className="text-sm text-center mt-2">Add destinations to see your trip statistics</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Trip Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost by Category</h3>
          <div className="flex justify-center">
            <div style={{ maxWidth: '300px', maxHeight: '300px' }}>
              <Pie data={pieData} options={{ maintainAspectRatio: true, responsive: true }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost per Destination</h3>
          <Bar
            data={barData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => `$${value}`,
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Destination
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Time (h)
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Travelers
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{item.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {item.estimated_time_hours}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {item.number_of_travelers}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                    ${(item.estimated_cost * item.number_of_travelers).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-sm text-gray-900">
                  Total
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  ${totalCost.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
