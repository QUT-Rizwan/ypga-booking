import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVenues } from '../services/api';
import Spinner from '../components/Spinner';

export default function VenuesPage() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVenues().then(r => setVenues(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Venues</h1>
      <p className="text-gray-500 mb-8">Find a studio near you and book your next class.</p>

      {loading ? <Spinner /> : (
        <>
          {venues.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🏛️</div>
              <p>No venues available yet.</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map(v => (
              <div key={v._id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition overflow-hidden">
                <div className="bg-gradient-to-br from-teal-100 to-green-100 h-40 flex items-center justify-center text-6xl">
                  🧘
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-gray-800">{v.name}</h2>
                  <p className="text-gray-500 text-sm mt-1">{v.address}</p>
                  <p className="text-gray-500 text-sm">{v.suburb}, {v.state}</p>
                  {v.phone && <p className="text-gray-400 text-xs mt-1">📞 {v.phone}</p>}

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-teal-600 font-medium bg-teal-50 px-2 py-1 rounded">
                      Capacity: {v.capacity}
                    </span>
                    <Link to={`/timetable?venue=${v._id}`}
                      className="text-sm bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition">
                      View Schedule
                    </Link>
                  </div>

                  {v.description && (
                    <p className="text-gray-500 text-xs mt-3 line-clamp-2">{v.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
