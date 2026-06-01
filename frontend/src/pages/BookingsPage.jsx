import React, { useEffect, useState } from 'react';
import { getMyBookings, cancelBooking } from '../services/api';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [tab, setTab] = useState('upcoming');

  const fetch = () => {
    setLoading(true);
    getMyBookings().then(r => setBookings(r.data)).catch(() => setBookings([])).finally(() => setLoading(false));
  };
  useEffect(fetch, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(id);
    setMsg({ type: '', text: '' });
    try {
      await cancelBooking(id);
      setMsg({ type: 'success', text: 'Booking cancelled.' });
      fetch();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to cancel booking.' });
    } finally {
      setCancelling(null);
    }
  };

  const now = new Date();
  const upcoming = bookings.filter(b => b.status === 'confirmed' && new Date(b.session?.date) >= now);
  const past = bookings.filter(b => b.status === 'cancelled' || new Date(b.session?.date) < now);
  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Bookings</h1>

      {msg.text && <div className="mb-4"><Alert type={msg.type} message={msg.text} /></div>}

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {['upcoming', 'past'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium capitalize transition ${tab === t
              ? 'border-b-2 border-teal-600 text-teal-600'
              : 'text-gray-500 hover:text-gray-700'}`}>
            {t} {t === 'upcoming' ? `(${upcoming.length})` : `(${past.length})`}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <>
          {list.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">📋</div>
              <p>{tab === 'upcoming' ? 'No upcoming bookings.' : 'No past bookings.'}</p>
            </div>
          )}
          <div className="space-y-4">
            {list.map(b => {
              const session = b.session;
              const isPast = new Date(session?.date) < now;
              return (
                <div key={b._id} className="bg-white rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        b.status === 'cancelled' ? 'bg-red-100 text-red-600' : isPast ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'
                      }`}>
                        {b.status === 'cancelled' ? 'Cancelled' : isPast ? 'Completed' : 'Confirmed'}
                      </span>
                      <span className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded">{session?.type}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800">{session?.title}</h3>
                    <p className="text-gray-500 text-sm">{session?.venue?.name} · {session?.venue?.suburb}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {session?.date && new Date(session.date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })} at {session?.startTime}
                    </p>
                    <p className="text-gray-400 text-xs">Instructor: {session?.instructor} · {session?.duration} min</p>
                  </div>
                  {tab === 'upcoming' && b.status === 'confirmed' && !isPast && (
                    <button onClick={() => handleCancel(b._id)} disabled={cancelling === b._id}
                      className="text-sm border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50 transition whitespace-nowrap">
                      {cancelling === b._id ? 'Cancelling…' : 'Cancel Booking'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
