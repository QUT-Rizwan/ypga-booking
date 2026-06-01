const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    suburb: { type: String, required: true },
    state: { type: String, required: true },
    phone: { type: String, default: '' },
    capacity: { type: Number, required: true, min: 1 },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Venue', venueSchema);
