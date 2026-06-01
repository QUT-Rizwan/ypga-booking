const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Hatha', 'Vinyasa', 'Yin', 'Bikram', 'Ashtanga', 'Restorative', 'Other'],
      required: true,
    },
    instructor: { type: String, required: true },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    duration: { type: Number, required: true, min: 15 }, // minutes
    capacity: { type: Number, required: true, min: 1 },
    bookedCount: { type: Number, default: 0 },
    isRecurring: { type: Boolean, default: false },
    recurringEndDate: { type: Date },
    isCancelled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

sessionSchema.virtual('availableSpots').get(function () {
  return this.capacity - this.bookedCount;
});

module.exports = mongoose.model('Session', sessionSchema);
