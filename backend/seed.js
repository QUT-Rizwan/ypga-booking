/**
 * Seed script — populates the database with demo data
 * Run: node seed.js
 *
 * Creates:
 *  - 1 Admin user    → admin@yogabook.com   / Admin@123
 *  - 1 Member user   → member@yogabook.com  / Member@123
 *  - 3 Venues
 *  - 2 Membership Plans
 *  - 1 Active Membership for the member
 *  - 12 Upcoming Sessions (4 per venue)
 *  - 2 Bookings for the member
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Venue = require('./models/Venue');
const Session = require('./models/Session');
const MembershipPlan = require('./models/MembershipPlan');
const Membership = require('./models/Membership');
const Booking = require('./models/Booking');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yoga-booking';

// Helpers
const daysFromNow = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}), Venue.deleteMany({}), Session.deleteMany({}),
    MembershipPlan.deleteMany({}), Membership.deleteMany({}), Booking.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // ── Users ──────────────────────────────────────────────────────────
  const admin = await User.create({
    name: 'Admin User', email: 'admin@yogabook.com',
    password: 'Admin@123', role: 'admin',
  });

  const member = await User.create({
    name: 'Sam Wilson', email: 'member@yogabook.com',
    password: 'Member@123', role: 'member', phone: '0412 345 678',
  });
  console.log('👤 Users created');

  // ── Venues ─────────────────────────────────────────────────────────
  const [v1, v2, v3] = await Venue.insertMany([
    { name: 'Brisbane CBD Studio', address: '100 Queen Street', suburb: 'Brisbane City', state: 'QLD', phone: '07 3000 1111', capacity: 20, description: 'A serene studio in the heart of Brisbane CBD.' },
    { name: 'South Bank Wellness', address: '22 Grey Street', suburb: 'South Bank', state: 'QLD', phone: '07 3000 2222', capacity: 15, description: 'Riverside studio with views of the parklands.' },
    { name: 'Fortitude Valley Flow', address: '5 Brunswick Street', suburb: 'Fortitude Valley', state: 'QLD', phone: '07 3000 3333', capacity: 25, description: 'Urban studio with a vibrant community feel.' },
  ]);
  console.log('🏛️  Venues created');

  // ── Membership Plans ───────────────────────────────────────────────
  const [weeklyPlan, monthlyPlan] = await MembershipPlan.insertMany([
    { name: 'Weekly Pass', description: 'Unlimited classes for 7 days', price: 29, durationDays: 7 },
    { name: 'Monthly Membership', description: 'Unlimited classes for 30 days — best value', price: 79, durationDays: 30 },
  ]);
  console.log('🎟️  Membership plans created');

  // ── Active Membership for member ───────────────────────────────────
  await Membership.create({
    user: member._id, plan: monthlyPlan._id,
    startDate: new Date(), endDate: daysFromNow(30), status: 'active',
  });
  console.log('✅ Membership activated for member');

  // ── Sessions ───────────────────────────────────────────────────────
  const sessionData = [
    // Brisbane CBD Studio
    { title: 'Morning Hatha Flow', type: 'Hatha', instructor: 'Sarah Chen', venue: v1._id, date: daysFromNow(1), startTime: '07:00', duration: 60, capacity: 20 },
    { title: 'Lunchtime Vinyasa', type: 'Vinyasa', instructor: 'James Park', venue: v1._id, date: daysFromNow(1), startTime: '12:00', duration: 45, capacity: 15 },
    { title: 'Yin & Restore', type: 'Yin', instructor: 'Emma Liu', venue: v1._id, date: daysFromNow(2), startTime: '18:00', duration: 75, capacity: 18 },
    { title: 'Weekend Ashtanga', type: 'Ashtanga', instructor: 'Sarah Chen', venue: v1._id, date: daysFromNow(5), startTime: '09:00', duration: 90, capacity: 12 },
    // South Bank Wellness
    { title: 'Sunrise Vinyasa', type: 'Vinyasa', instructor: 'Maya Thompson', venue: v2._id, date: daysFromNow(1), startTime: '06:30', duration: 60, capacity: 15 },
    { title: 'Restorative Evening', type: 'Restorative', instructor: 'David Kim', venue: v2._id, date: daysFromNow(2), startTime: '19:00', duration: 60, capacity: 12 },
    { title: 'Bikram Basics', type: 'Bikram', instructor: 'Maya Thompson', venue: v2._id, date: daysFromNow(3), startTime: '10:00', duration: 90, capacity: 15 },
    { title: 'Gentle Hatha', type: 'Hatha', instructor: 'David Kim', venue: v2._id, date: daysFromNow(6), startTime: '11:00', duration: 60, capacity: 15 },
    // Fortitude Valley Flow
    { title: 'Power Vinyasa', type: 'Vinyasa', instructor: 'Alex Rivera', venue: v3._id, date: daysFromNow(1), startTime: '18:00', duration: 60, capacity: 25 },
    { title: 'Yin Yoga Deep Stretch', type: 'Yin', instructor: 'Lisa Nguyen', venue: v3._id, date: daysFromNow(2), startTime: '07:30', duration: 75, capacity: 20 },
    { title: 'All-Levels Hatha', type: 'Hatha', instructor: 'Alex Rivera', venue: v3._id, date: daysFromNow(4), startTime: '09:00', duration: 60, capacity: 25 },
    { title: 'Saturday Ashtanga', type: 'Ashtanga', instructor: 'Lisa Nguyen', venue: v3._id, date: daysFromNow(6), startTime: '08:00', duration: 90, capacity: 20 },
  ];

  const sessions = await Session.insertMany(sessionData);
  console.log(`📅 ${sessions.length} sessions created`);

  // ── Sample Bookings for member ─────────────────────────────────────
  await Booking.create({ user: member._id, session: sessions[0]._id, status: 'confirmed' });
  await Session.findByIdAndUpdate(sessions[0]._id, { $inc: { bookedCount: 1 } });

  await Booking.create({ user: member._id, session: sessions[4]._id, status: 'confirmed' });
  await Session.findByIdAndUpdate(sessions[4]._id, { $inc: { bookedCount: 1 } });
  console.log('📋 Sample bookings created');

  // ── Summary ────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════');
  console.log('  🌿 YogaBook seed complete!');
  console.log('══════════════════════════════════════');
  console.log('  Admin:  admin@yogabook.com  / Admin@123');
  console.log('  Member: member@yogabook.com / Member@123');
  console.log('══════════════════════════════════════\n');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  mongoose.connection.close();
  process.exit(1);
});
