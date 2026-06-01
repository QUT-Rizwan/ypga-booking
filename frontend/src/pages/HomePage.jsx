import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getVenues, getSessions } from '../services/api';
import Spinner from '../components/Spinner';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getVenues(), getSessions()])
      .then(([v, s]) => { setVenues(v.data.slice(0, 3)); setSessions(s.data.slice(0, 4)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-700 to-teal-500 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Flow</h1>
        <p className="text-lg md:text-xl text-teal-100 mb-8 max-w-xl mx-auto">
          Book yoga classes at multiple venues. Flexible memberships. All skill levels welcome.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {user ? (
            <button onClick={() => navigate('/timetable')}
              className="bg-white text-teal-700 font-semibold px-8 py-3 rounded-lg hover:bg-teal-50 transition">
              Browse Classes
            </button>
          ) : (
            <>
              <Link to="/register" className="bg-white text-teal-700 font-semibold px-8 py-3 rounded-lg hover:bg-teal-50 transition">
                Get Started — Free
              </Link>
              <Link to="/timetable" className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-teal-600 transition">
                View Timetable
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            { icon: '🏛️', title: 'Multiple Venues', desc: 'Classes at various locations across the city' },
            { icon: '📅', title: 'Flexible Booking', desc: 'Book, cancel, and manage sessions easily' },
            { icon: '🎟️', title: 'Membership Plans', desc: 'Monthly or weekly plans to suit your lifestyle' },
          ].map(f => (
            <div key={f.title} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Venues */}
      <section className="py-12 px-4 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Our Venues</h2>
          <Link to="/venues" className="text-teal-600 hover:underline text-sm">View all →</Link>
        </div>
        {loading ? <Spinner /> : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {venues.length === 0 && <p className="text-gray-500">No venues available yet.</p>}
            {venues.map(v => (
              <div key={v._id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition overflow-hidden">
                <div className="bg-teal-100 h-32 flex items-center justify-center text-5xl">🧘</div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800">{v.name}</h3>
                  <p className="text-gray-500 text-sm">{v.suburb}, {v.state}</p>
                  <p className="text-gray-400 text-xs mt-1">Capacity: {v.capacity}</p>
                  <Link to="/timetable" className="mt-3 inline-block text-teal-600 text-sm hover:underline">
                    View Schedule →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Sessions */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Upcoming Classes</h2>
            <Link to="/timetable" className="text-teal-600 hover:underline text-sm">Full timetable →</Link>
          </div>
          {loading ? <Spinner /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.length === 0 && <p className="text-gray-500">No upcoming sessions.</p>}
              {sessions.map(s => (
                <div key={s._id} className="bg-white rounded-xl p-4 border hover:shadow-sm transition flex justify-between items-center">
                  <div>
                    <span className="inline-block bg-teal-100 text-teal-700 text-xs font-medium px-2 py-0.5 rounded mb-1">{s.type}</span>
                    <h4 className="font-semibold text-gray-800">{s.title}</h4>
                    <p className="text-gray-500 text-sm">{s.venue?.name} · {new Date(s.date).toLocaleDateString()} at {s.startTime}</p>
                    <p className="text-gray-400 text-xs">with {s.instructor} · {s.duration} min</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-teal-600">{s.capacity - s.bookedCount} spots</p>
                    <Link to={user ? '/timetable' : '/register'}
                      className="mt-1 inline-block bg-teal-600 text-white text-xs px-3 py-1 rounded hover:bg-teal-700">
                      Book
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-16 px-4 text-center bg-teal-700 text-white">
          <h2 className="text-3xl font-bold mb-3">Ready to start your yoga journey?</h2>
          <p className="text-teal-100 mb-6">Create a free account and book your first class today.</p>
          <Link to="/register" className="bg-white text-teal-700 font-semibold px-8 py-3 rounded-lg hover:bg-teal-50 transition">
            Sign Up Free
          </Link>
        </section>
      )}
    </div>
  );
}
