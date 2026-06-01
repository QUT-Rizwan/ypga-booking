import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../../services/api';
import Spinner from '../../components/Spinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Total Members', value: stats.totalUsers, icon: '👥', color: 'bg-blue-50 text-blue-700', link: '/admin/users' },
    { label: 'Active Members', value: stats.activeMembers, icon: '🎟️', color: 'bg-green-50 text-green-700', link: '/admin/users' },
    { label: 'Active Venues', value: stats.totalVenues, icon: '🏛️', color: 'bg-purple-50 text-purple-700', link: '/admin/venues' },
    { label: 'Upcoming Sessions', value: stats.totalSessions, icon: '📅', color: 'bg-orange-50 text-orange-700', link: '/admin/sessions' },
    { label: 'Confirmed Bookings', value: stats.totalBookings, icon: '✅', color: 'bg-teal-50 text-teal-700', link: '/admin/bookings' },
  ] : [];

  const quickLinks = [
    { label: 'Add Venue', to: '/admin/venues', icon: '🏛️' },
    { label: 'Create Session', to: '/admin/sessions', icon: '📅' },
    { label: 'View Bookings', to: '/admin/bookings', icon: '📋' },
    { label: 'Manage Users', to: '/admin/users', icon: '👥' },
    { label: 'Membership Plans', to: '/admin/plans', icon: '🎟️' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Overview of your yoga booking platform.</p>

      {loading ? <Spinner /> : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
            {cards.map(c => (
              <Link key={c.label} to={c.link} className={`${c.color} rounded-xl p-4 hover:opacity-90 transition`}>
                <div className="text-2xl mb-2">{c.icon}</div>
                <div className="text-2xl font-bold">{c.value}</div>
                <div className="text-xs font-medium mt-0.5 opacity-80">{c.label}</div>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {quickLinks.map(l => (
              <Link key={l.label} to={l.to}
                className="bg-white border rounded-xl p-4 text-center hover:shadow-md transition">
                <div className="text-3xl mb-2">{l.icon}</div>
                <div className="text-sm font-medium text-gray-700">{l.label}</div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
