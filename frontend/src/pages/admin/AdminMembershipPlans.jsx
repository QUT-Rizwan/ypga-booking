import React, { useEffect, useState } from 'react';
import { getAllPlans, createPlan, updatePlan, deletePlan } from '../../services/api';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import Modal from '../../components/Modal';

const empty = { name: '', description: '', price: '', durationDays: '', isActive: true };

export default function AdminMembershipPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetch = () => { setLoading(true); getAllPlans().then(r => setPlans(r.data)).finally(() => setLoading(false)); };
  useEffect(fetch, []);

  const open = (p = null) => { setEditing(p); setForm(p ? { ...p } : empty); setModal(true); setMsg({ type: '', text: '' }); };
  const close = () => { setModal(false); setEditing(null); };

  const handleChange = e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true); setMsg({ type: '', text: '' });
    try {
      if (editing) await updatePlan(editing._id, form);
      else await createPlan(form);
      setMsg({ type: 'success', text: `Plan ${editing ? 'updated' : 'created'}.` });
      fetch(); close();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed.' });
    } finally { setSaving(false); }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this plan?')) return;
    try { await deletePlan(id); fetch(); } catch { }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Membership Plans</h1>
        <button onClick={() => open()} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-700 transition">+ Add Plan</button>
      </div>

      {loading ? <Spinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {plans.length === 0 && <p className="text-gray-400 text-sm">No plans yet.</p>}
          {plans.map(p => (
            <div key={p._id} className={`bg-white rounded-xl border p-5 ${!p.isActive ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800 text-lg">{p.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {p.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-2xl font-bold text-teal-600">${p.price} <span className="text-sm font-normal text-gray-400">AUD</span></p>
              <p className="text-sm text-gray-500 mt-1">{p.durationDays} days access</p>
              {p.description && <p className="text-xs text-gray-400 mt-2">{p.description}</p>}
              <div className="flex gap-3 mt-4">
                <button onClick={() => open(p)} className="text-teal-600 hover:underline text-sm">Edit</button>
                {p.isActive && <button onClick={() => handleDeactivate(p._id)} className="text-red-500 hover:underline text-sm">Deactivate</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={editing ? 'Edit Plan' : 'Add Plan'} onClose={close}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Alert type={msg.type} message={msg.text} />
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Plan Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Price (AUD)</label>
                <input type="number" name="price" value={form.price} onChange={handleChange} required min={0} step="0.01"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Duration (days)</label>
                <input type="number" name="durationDays" value={form.durationDays} onChange={handleChange} required min={1}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
              Active (visible to users)
            </label>
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
