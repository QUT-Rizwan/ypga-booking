import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSessions, getVenues, createBooking } from '../services/api';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

export default function TimetablePage() {
  const { user, isMember } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [sessions, setSessions] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [filters, setFilters] = useState({
    venue: searchParams.get('venue') || '',
    date: '',
  });

  const fetchSessions = () => {
    setLoading(true);
    const params = {};
    if (filters.venue) params.venue = filters.venue;
    if (filters.date) params.date = filters.date;
    getSessions(params)
      .then(r => setSessions(r.data))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getVenues().then(r => setVenues(r.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchSessions(); }, [filters]);

  const handleBook = async (sessionId) => {
    if (!user) { navigate('/register', { state: { from: '/timetable' } }); return; }
    if (!isMember) { navigate('/membership'); return; }
    setBooking(sessionId);
    setMsg({ type: '', text: '' });
    try {
      await createBooking(sessionId);
      setMsg({ type: 'success', text: 'Session booked successfully!' });
      fetchSessions();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Booking failed' });
    } finally {
      setBooking(null);
    }
  };

  const typeColors = {
    Hatha: 'bg-blue-100 text-blue-700',
    Vinyasa: 'bg-purple-100 text-purple-700',
    Yin: 'bg-pink-100 text-pink-700',
    Bikram: 'bg-orange-100 text-orange-700',
    Ashtanga: 'bg-red-100 text-red-700',
    Restorative: 'bg-green-100 text-green-700',
    Other: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Class Timetable</h1>
      <p className="text-gray-500 mb-6">Browse and book upcoming yoga sessions.</p>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Venue</label>
          <select value={filters.venue} onChange={e => setFilters({ ...filters, venue: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">All Venues</option>
            {venues.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
          <input type="date" value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div className="flex items-end">
          <button onClick={() => setFilters({ venue: '', date: '' })}
            className="text-sm text-teal-600 hover:underline whitespace-nowrap">Clear filters</button>
        </div>
      </div>

      {msg.text && <div className="mb-4"><Alert type={msg.type} message={msg.text} /></div>}

      {!user && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6 text-sm text-teal-700">
          <Link to="/register" className="font-semibold hover:underline">Register</Link> or{' '}
          <Link to="/login" className="font-semibold hover:underline">log in</Link> to book a session.
        </div>
      )}

      {loading ? <Spinner /> : (
        <>
          {sessions.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">📅</div>
              <p>No sessions found. Try adjusting your filters.</p>
            </div>
          )}
          <div className="space-y-3">
            {sessions.map(s => {
              const spots = s.capacity - s.bookedCount;
              const full = spots <= 0;
              return (
                <div key={s._id} className="bg-white rounded-xl border hover:shadow-sm transition p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${typeColors[s.type] || typeColors.Other}`}>{s.type}</span>
                      {s.isCancelled && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Cancelled</span>}
                    </div>
                    <h3 className="font-semibold text-gray-800">{s.title}</h3>
                    <p className="text-gray-500 text-sm">{s.venue?.name} · {s.venue?.suburb}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {new Date(s.date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })} at {s.startTime} · {s.duration} min · with {s.instructor}
                    </p>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-3">
                    <span className={`text-sm font-medium ${full ? 'text-red-500' : 'text-teal-600'}`}>
                      {full ? 'Full' : `${spots} spot${spots !== 1 ? 's' : ''} left`}
                    </span>
                    {!s.isCancelled && (
                      <button onClick={() => handleBook(s._id)}
                        disabled={full || booking === s._id}
                        className="bg-teal-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition whitespace-nowrap">
                        {booking === s._id ? 'Booking…' : full ? 'Full' : 'Book Now'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
