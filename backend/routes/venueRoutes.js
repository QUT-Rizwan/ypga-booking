const express = require('express');
const {
  getVenues, getAllVenues, getVenueById,
  createVenue, updateVenue, deleteVenue,
} = require('../controllers/venueController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const router = express.Router();

router.get('/', getVenues);                            // public
router.get('/all', protect, adminOnly, getAllVenues);   // admin
router.get('/:id', getVenueById);                      // public
router.post('/', protect, adminOnly, createVenue);     // admin
router.put('/:id', protect, adminOnly, updateVenue);   // admin
router.delete('/:id', protect, adminOnly, deleteVenue);// admin

module.exports = router;
