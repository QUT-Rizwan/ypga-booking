import React, { useEffect, useState } from 'react';
import { getAllBookings, cancelBooking } from '../../services/api';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetch = () => {
    setLoading(true);
    getAllBookings().then(r => setBookings(r.data)).catch(() => setBookings([])).finally(() => setLoading(false));
  };
  useEffect(fetch, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(id); setMsg({ type: '', text: '' });
    try { await cancelBooking(id); setMsg({ type: 'success', text: 'Booking cancelled.' }); fetch(); }
    catch (err) { setMsg({ type: 'error', text: err.response?.data?.message || 'Failed.' }); }
    finally { setCancelling(null); }
  };

  const filtered = bookings.filter(b => {
    const matchSearch = !search ||
      b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      b.session?.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">All Bookings</h1>

      {msg.text && <div className="mb-4"><Alert type={msg.type} message={msg.text} /></div>}

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input type="text" placeholder="Search member or session…" value={search} onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:ring-2 focus:ring-teal-500 focus:outline-none" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none">
          <option value="all">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>{['Member', 'Session', 'Venue', 'Date', 'Status', 'Booked At', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No bookings found.</td></tr>}
              {filtered.map(b => (
                <tr key={b._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{b.user?.name}</p>
                    <p className="text-gray-400 text-xs">{b.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{b.session?.title}</td>
                  <td className="px-4 py-3 text-gray-500">{b.session?.venue?.name}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {b.session?.date ? new Date(b.session.date).toLocaleDateString('en-AU') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(b.createdAt).toLocaleDateString('en-AU')}
                  </td>
                  <td className="px-4 py-3">
                    {b.status === 'confirmed' && (
                      <button onClick={() => handleCancel(b._id)} disabled={cancelling === b._id}
                        className="text-red-500 hover:underline text-xs disabled:opacity-50">
                        {cancelling === b._id ? 'Cancelling…' : 'Cancel'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 text-xs text-gray-400 border-t">
            Showing {filtered.length} of {bookings.length} bookings
          </div>
        </div>
      )}
    </div>
  );
}
