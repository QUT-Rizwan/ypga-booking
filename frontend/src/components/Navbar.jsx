import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="bg-teal-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold tracking-tight">🧘 YogaBook</Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/venues" className="hover:text-teal-200">Venues</Link>
          <Link to="/timetable" className="hover:text-teal-200">Timetable</Link>
          {user ? (
            <>
              <Link to="/bookings" className="hover:text-teal-200">My Bookings</Link>
              <Link to="/membership" className="hover:text-teal-200">Membership</Link>
              {isAdmin && <Link to="/admin" className="hover:text-teal-200">Admin</Link>}
              <Link to="/profile" className="hover:text-teal-200">{user.name}</Link>
              <button onClick={handleLogout} className="bg-white text-teal-700 px-3 py-1 rounded hover:bg-teal-50">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-teal-200">Login</Link>
              <Link to="/register" className="bg-white text-teal-700 px-3 py-1 rounded hover:bg-teal-50">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>☰</button>
      </div>
      {open && (
        <div className="md:hidden px-4 pb-3 flex flex-col gap-2 text-sm">
          <Link to="/venues" onClick={() => setOpen(false)}>Venues</Link>
          <Link to="/timetable" onClick={() => setOpen(false)}>Timetable</Link>
          {user ? (
            <>
              <Link to="/bookings" onClick={() => setOpen(false)}>My Bookings</Link>
              <Link to="/membership" onClick={() => setOpen(false)}>Membership</Link>
              {isAdmin && <Link to="/admin" onClick={() => setOpen(false)}>Admin</Link>}
              <button onClick={handleLogout} className="text-left">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
