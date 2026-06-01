import React, { useEffect, useState } from 'react';
import { getAllSessions, getVenues, createSession, updateSession, cancelSession } from '../../services/api';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import Modal from '../../components/Modal';

const TYPES = ['Hatha', 'Vinyasa', 'Yin', 'Bikram', 'Ashtanga', 'Restorative', 'Other'];
const empty = { title: '', type: 'Hatha', instructor: '', venue: '', date: '', startTime: '', duration: 60, capacity: 10, isRecurring: false, recurringEndDate: '' };

export default function AdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetch = () => {
    setLoading(true);
    Promise.all([getAllSessions(), getVenues()])
      .then(([s, v]) => { setSessions(s.data); setVenues(v.data); })
      .finally(() => setLoading(false));
  };
  useEffect(fetch, []);

  const open = (s = null) => {
    setEditing(s);
    setForm(s ? { ...s, venue: s.venue?._id || s.venue, date: s.date?.split('T')[0] } : empty);
    setModal(true); setMsg({ type: '', text: '' });
  };
  const close = () => { setModal(false); setEditing(null); };

  const handleChange = e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true); setMsg({ type: '', text: '' });
    try {
      if (editing) await updateSession(editing._id, form);
      else await createSession(form);
      setMsg({ type: 'success', text: `Session ${editing ? 'updated' : 'created'} successfully.` });
      fetch(); close();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save session.' });
    } finally { setSaving(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this session?')) return;
    try { await cancelSession(id); fetch(); } catch { }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sessions</h1>
        <button onClick={() => open()} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-700 transition">+ Create Session</button>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>{['Title', 'Type', 'Venue', 'Date', 'Time', 'Capacity', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y">
              {sessions.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No sessions yet.</td></tr>}
              {sessions.map(s => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{s.title}</td>
                  <td className="px-4 py-3 text-gray-500">{s.type}</td>
                  <td className="px-4 py-3 text-gray-500">{s.venue?.name}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(s.date).toLocaleDateString('en-AU')}</td>
                  <td className="px-4 py-3 text-gray-500">{s.startTime}</td>
                  <td className="px-4 py-3 text-gray-500">{s.bookedCount}/{s.capacity}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${s.isCancelled ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                      {s.isCancelled ? 'Cancelled' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => open(s)} className="text-teal-600 hover:underline text-xs">Edit</button>
                      {!s.isCancelled && <button onClick={() => handleCancel(s._id)} className="text-red-500 hover:underline text-xs">Cancel</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={editing ? 'Edit Session' : 'Create Session'} onClose={close}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Alert type={msg.type} message={msg.text} />
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select name="type" value={form.type} onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none">
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Venue</label>
                <select name="venue" value={form.venue} onChange={handleChange} required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none">
                  <option value="">Select venue</option>
                  {venues.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Instructor</label>
              <input type="text" name="instructor" value={form.instructor} onChange={handleChange} required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Duration (min)</label>
                <input type="number" name="duration" value={form.duration} onChange={handleChange} min={15} required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Capacity</label>
                <input type="number" name="capacity" value={form.capacity} onChange={handleChange} min={1} required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
              </div>
            </div>
            {!editing && (
              <>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" name="isRecurring" checked={form.isRecurring} onChange={handleChange} />
                  Recurring (weekly)
                </label>
                {form.isRecurring && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Repeat Until</label>
                    <input type="date" name="recurringEndDate" value={form.recurringEndDate} onChange={handleChange} required
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                  </div>
                )}
              </>
            )}
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50 transition">
                {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={close} className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50 transition">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
