const Booking = require('../models/Booking');
const Session = require('../models/Session');
const Membership = require('../models/Membership');

// GET /api/bookings/my — member
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({ path: 'session', populate: { path: 'venue', select: 'name suburb' } })
      .sort({ 'session.date': -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/bookings — admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate({ path: 'session', populate: { path: 'venue', select: 'name suburb' } })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/bookings — member
const createBooking = async (req, res) => {
  try {
    const { sessionId } = req.body;

    // Check active membership
    const membership = await Membership.findOne({
      user: req.user._id, status: 'active', endDate: { $gte: new Date() },
    });
    if (!membership) return res.status(403).json({ message: 'Active membership required to book' });

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.isCancelled) return res.status(400).json({ message: 'Session is cancelled' });
    if (session.bookedCount >= session.capacity)
      return res.status(400).json({ message: 'Session is fully booked' });

    const existing = await Booking.findOne({ user: req.user._id, session: sessionId });
    if (existing) return res.status(400).json({ message: 'Already booked this session' });

    const booking = await Booking.create({ user: req.user._id, session: sessionId });
    await Session.findByIdAndUpdate(sessionId, { $inc: { bookedCount: 1 } });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/bookings/:id/cancel — member or admin
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Members can only cancel their own bookings
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorised' });

    if (booking.status === 'cancelled')
      return res.status(400).json({ message: 'Booking already cancelled' });

    booking.status = 'cancelled';
    await booking.save();
    await Session.findByIdAndUpdate(booking.session, { $inc: { bookedCount: -1 } });

    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyBookings, getAllBookings, createBooking, cancelBooking };
