import React, { useEffect, useState } from 'react';
import { getPlans, getMyMembership, purchaseMembership, renewMembership } from '../services/api';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

export default function MembershipPage() {
  const [plans, setPlans] = useState([]);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchData = () => {
    setLoading(true);
    Promise.all([getPlans(), getMyMembership()])
      .then(([p, m]) => { setPlans(p.data); setMembership(m.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(fetchData, []);

  const isActive = membership?.status === 'active' && new Date(membership?.endDate) >= new Date();

  const handlePurchase = async (planId) => {
    setProcessing(planId); setMsg({ type: '', text: '' });
    try {
      await purchaseMembership(planId);
      setMsg({ type: 'success', text: 'Membership purchased successfully!' });
      fetchData();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Purchase failed.' });
    } finally { setProcessing(null); }
  };

  const handleRenew = async (planId) => {
    setProcessing(planId); setMsg({ type: '', text: '' });
    try {
      await renewMembership(planId);
      setMsg({ type: 'success', text: 'Membership renewed successfully!' });
      fetchData();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Renewal failed.' });
    } finally { setProcessing(null); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Membership</h1>
      <p className="text-gray-500 mb-8">Choose a plan to book yoga sessions.</p>

      {loading ? <Spinner /> : (
        <>
          {msg.text && <div className="mb-4"><Alert type={msg.type} message={msg.text} /></div>}

          {/* Current Membership */}
          <div className={`rounded-xl p-6 mb-8 ${isActive ? 'bg-teal-50 border border-teal-200' : 'bg-gray-50 border border-gray-200'}`}>
            <h2 className="font-semibold text-gray-700 mb-3">Current Membership</h2>
            {membership && isActive ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-lg font-bold text-teal-700">{membership.plan?.name}</p>
                  <p className="text-sm text-gray-500">
                    Valid from {new Date(membership.startDate).toLocaleDateString('en-AU')} to{' '}
                    <span className="font-medium text-gray-700">{new Date(membership.endDate).toLocaleDateString('en-AU')}</span>
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                  ✓ Active
                </span>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">You don't have an active membership. Choose a plan below.</p>
            )}
          </div>

          {/* Plans */}
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {isActive ? 'Renew or Change Plan' : 'Available Plans'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map(p => (
              <div key={p._id} className="bg-white rounded-xl border hover:shadow-md transition p-6 flex flex-col">
                <h3 className="text-lg font-bold text-gray-800">{p.name}</h3>
                <p className="text-3xl font-bold text-teal-600 my-3">${p.price}<span className="text-sm font-normal text-gray-400"> AUD</span></p>
                <p className="text-sm text-gray-500 mb-1">{p.durationDays} days access</p>
                {p.description && <p className="text-xs text-gray-400 mb-4 flex-1">{p.description}</p>}
                <button
                  onClick={() => isActive ? handleRenew(p._id) : handlePurchase(p._id)}
                  disabled={processing === p._id}
                  className="mt-auto w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition text-sm font-medium">
                  {processing === p._id ? 'Processing…' : isActive ? 'Renew with this plan' : 'Purchase'}
                </button>
              </div>
            ))}
            {plans.length === 0 && <p className="text-gray-500 text-sm">No plans available yet.</p>}
          </div>
        </>
      )}
    </div>
  );
}
