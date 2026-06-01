const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
  },
  { timestamps: true }
);

// Auto-expire: check status on read
membershipSchema.pre('find', function () {
  this.where({ endDate: { $gte: new Date() } });
});

module.exports = mongoose.model('Membership', membershipSchema);
