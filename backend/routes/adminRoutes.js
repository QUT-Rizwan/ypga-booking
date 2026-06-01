const express = require('express');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Session = require('../models/Session');
const Venue = require('../models/Venue');
const Membership = require('../models/Membership');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const router = express.Router();

// GET /api/admin/dashboard
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalVenues, totalSessions, totalBookings, activeMembers] =
      await Promise.all([
        User.countDocuments({ role: { $ne: 'admin' } }),
        Venue.countDocuments({ isActive: true }),
        Session.countDocuments({ isCancelled: false, date: { $gte: new Date() } }),
        Booking.countDocuments({ status: 'confirmed' }),
        Membership.countDocuments({ status: 'active', endDate: { $gte: new Date() } }),
      ]);
    res.json({ totalUsers, totalVenues, totalSessions, totalBookings, activeMembers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, { role, isActive }, { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
