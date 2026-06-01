const express = require('express');
const {
  getMyBookings, getAllBookings, createBooking, cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const router = express.Router();

router.get('/my', protect, getMyBookings);                 // member
router.get('/', protect, adminOnly, getAllBookings);        // admin
router.post('/', protect, createBooking);                  // member
router.put('/:id/cancel', protect, cancelBooking);         // member or admin

module.exports = router;
