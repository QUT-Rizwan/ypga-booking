import React, { useEffect, useState } from 'react';
import { getAdminUsers, updateUser } from '../../services/api';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [search, setSearch] = useState('');

  const fetch = () => { setLoading(true); getAdminUsers().then(r => setUsers(r.data)).finally(() => setLoading(false)); };
  useEffect(fetch, []);

  const handleUpdate = async (id, data) => {
    setSaving(id); setMsg({ type: '', text: '' });
    try { await updateUser(id, data); setMsg({ type: 'success', text: 'User updated.' }); fetch(); }
    catch { setMsg({ type: 'error', text: 'Failed to update user.' }); }
    finally { setSaving(null); }
  };

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors = { admin: 'bg-purple-100 text-purple-700', member: 'bg-teal-100 text-teal-700', guest: 'bg-gray-100 text-gray-600' };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Users</h1>

      {msg.text && <div className="mb-4"><Alert type={msg.type} message={msg.text} /></div>}

      <input type="text" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full max-w-sm mb-5 focus:ring-2 focus:ring-teal-500 focus:outline-none" />

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>{['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No users found.</td></tr>}
              {filtered.map(u => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <select value={u.role} onChange={e => handleUpdate(u._id, { role: e.target.value })}
                      disabled={saving === u._id}
                      className={`text-xs font-medium px-2 py-1 rounded border-0 cursor-pointer focus:ring-1 focus:ring-teal-500 ${roleColors[u.role]}`}>
                      <option value="guest">guest</option>
                      <option value="member">member</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString('en-AU')}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleUpdate(u._id, { isActive: !u.isActive })} disabled={saving === u._id}
                      className={`text-xs hover:underline ${u.isActive ? 'text-red-500' : 'text-teal-600'}`}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 text-xs text-gray-400 border-t">{filtered.length} users</div>
        </div>
      )}
    </div>
  );
}
