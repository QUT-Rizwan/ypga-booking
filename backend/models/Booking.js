const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    bookedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent duplicate bookings
bookingSchema.index({ user: 1, session: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
