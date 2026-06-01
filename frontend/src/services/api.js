import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
});

// Attach JWT to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);

// Venues
export const getVenues = () => API.get('/venues');
export const getAllVenues = () => API.get('/venues/all');
export const getVenueById = (id) => API.get(`/venues/${id}`);
export const createVenue = (data) => API.post('/venues', data);
export const updateVenue = (id, data) => API.put(`/venues/${id}`, data);
export const deleteVenue = (id) => API.delete(`/venues/${id}`);

// Sessions
export const getSessions = (params) => API.get('/sessions', { params });
export const getAllSessions = () => API.get('/sessions/all');
export const getSessionById = (id) => API.get(`/sessions/${id}`);
export const createSession = (data) => API.post('/sessions', data);
export const updateSession = (id, data) => API.put(`/sessions/${id}`, data);
export const cancelSession = (id) => API.delete(`/sessions/${id}`);

// Bookings
export const getMyBookings = () => API.get('/bookings/my');
export const getAllBookings = () => API.get('/bookings');
export const createBooking = (sessionId) => API.post('/bookings', { sessionId });
export const cancelBooking = (id) => API.put(`/bookings/${id}/cancel`);

// Memberships
export const getPlans = () => API.get('/memberships/plans');
export const getAllPlans = () => API.get('/memberships/plans/all');
export const createPlan = (data) => API.post('/memberships/plans', data);
export const updatePlan = (id, data) => API.put(`/memberships/plans/${id}`, data);
export const deletePlan = (id) => API.delete(`/memberships/plans/${id}`);
export const getMyMembership = () => API.get('/memberships/my');
export const purchaseMembership = (planId) => API.post('/memberships/purchase', { planId });
export const renewMembership = (planId) => API.put('/memberships/renew', { planId });

// Admin
export const getDashboardStats = () => API.get('/admin/dashboard');
export const getAdminUsers = () => API.get('/admin/users');
export const updateUser = (id, data) => API.put(`/admin/users/${id}`, data);

export default API;
