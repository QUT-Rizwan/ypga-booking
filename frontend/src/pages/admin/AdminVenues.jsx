import React, { useEffect, useState } from 'react';
import { getAllVenues, createVenue, updateVenue, deleteVenue } from '../../services/api';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import Modal from '../../components/Modal';

const empty = { name: '', address: '', suburb: '', state: '', phone: '', capacity: '', description: '', isActive: true };

export default function AdminVenues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetch = () => { setLoading(true); getAllVenues().then(r => setVenues(r.data)).finally(() => setLoading(false)); };
  useEffect(fetch, []);

  const open = (v = null) => { setEditing(v); setForm(v ? { ...v } : empty); setModal(true); setMsg({ type: '', text: '' }); };
  const close = () => { setModal(false); setEditing(null); };

  const handleChange = e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true); setMsg({ type: '', text: '' });
    try {
      if (editing) await updateVenue(editing._id, form);
      else await createVenue(form);
      setMsg({ type: 'success', text: `Venue ${editing ? 'updated' : 'created'} successfully.` });
      fetch(); close();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save venue.' });
    } finally { setSaving(false); }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this venue?')) return;
    try { await deleteVenue(id); fetch(); } catch { }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Venues</h1>
        <button onClick={() => open()} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-700 transition">+ Add Venue</button>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>{['Name', 'Location', 'Capacity', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y">
              {venues.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No venues yet.</td></tr>}
              {venues.map(v => (
                <tr key={v._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{v.name}</td>
                  <td className="px-4 py-3 text-gray-500">{v.suburb}, {v.state}</td>
                  <td className="px-4 py-3 text-gray-500">{v.capacity}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${v.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {v.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => open(v)} className="text-teal-600 hover:underline text-xs">Edit</button>
                      {v.isActive && <button onClick={() => handleDeactivate(v._id)} className="text-red-500 hover:underline text-xs">Deactivate</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={editing ? 'Edit Venue' : 'Add Venue'} onClose={close}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Alert type={msg.type} message={msg.text} />
            {[['name', 'Venue Name', 'text', true], ['address', 'Address', 'text', true], ['suburb', 'Suburb', 'text', true],
              ['state', 'State', 'text', true], ['phone', 'Phone', 'tel', false], ['capacity', 'Capacity', 'number', true],
            ].map(([name, label, type, req]) => (
              <div key={name}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input type={type} name={name} value={form[name] || ''} onChange={handleChange} required={req} min={type === 'number' ? 1 : undefined}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea name="description" value={form.description || ''} onChange={handleChange} rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="rounded" />
              Active
            </label>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50 transition">
                {saving ? 'Saving…' : editing ? 'Update Venue' : 'Create Venue'}
              </button>
              <button type="button" onClick={close} className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50 transition">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
