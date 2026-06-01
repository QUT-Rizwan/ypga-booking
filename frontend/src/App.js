import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VenuesPage from './pages/VenuesPage';
import TimetablePage from './pages/TimetablePage';

// Member Pages
import BookingsPage from './pages/BookingsPage';
import MembershipPage from './pages/MembershipPage';
import ProfilePage from './pages/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVenues from './pages/admin/AdminVenues';
import AdminSessions from './pages/admin/AdminSessions';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMembershipPlans from './pages/admin/AdminMembershipPlans';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/venues" element={<VenuesPage />} />
          <Route path="/timetable" element={<TimetablePage />} />

          {/* Member */}
          <Route path="/bookings" element={<PrivateRoute><BookingsPage /></PrivateRoute>} />
          <Route path="/membership" element={<PrivateRoute><MembershipPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/venues" element={<AdminRoute><AdminVenues /></AdminRoute>} />
          <Route path="/admin/sessions" element={<AdminRoute><AdminSessions /></AdminRoute>} />
          <Route path="/admin/bookings" element={<AdminRoute><AdminBookings /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/plans" element={<AdminRoute><AdminMembershipPlans /></AdminRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
