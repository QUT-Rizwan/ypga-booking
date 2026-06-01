const Venue = require('../models/Venue');

// GET /api/venues — public
const getVenues = async (req, res) => {
  try {
    const venues = await Venue.find({ isActive: true }).sort({ name: 1 });
    res.json(venues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/venues/all — admin only (includes inactive)
const getAllVenues = async (req, res) => {
  try {
    const venues = await Venue.find().sort({ createdAt: -1 });
    res.json(venues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/venues/:id — public
const getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ message: 'Venue not found' });
    res.json(venue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/venues — admin
const createVenue = async (req, res) => {
  try {
    const venue = await Venue.create(req.body);
    res.status(201).json(venue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/venues/:id — admin
const updateVenue = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!venue) return res.status(404).json({ message: 'Venue not found' });
    res.json(venue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/venues/:id — admin (soft delete)
const deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndUpdate(
      req.params.id, { isActive: false }, { new: true }
    );
    if (!venue) return res.status(404).json({ message: 'Venue not found' });
    res.json({ message: 'Venue deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getVenues, getAllVenues, getVenueById, createVenue, updateVenue, deleteVenue };
