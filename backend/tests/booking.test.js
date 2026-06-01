const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const User = require('../models/User');
const Venue = require('../models/Venue');
const Session = require('../models/Session');
const Membership = require('../models/Membership');
const MembershipPlan = require('../models/MembershipPlan');
const Booking = require('../models/Booking');

require('./helpers');

chai.use(chaiHttp);
const { expect } = chai;

describe('Booking API', () => {
  let memberToken;
  let adminToken;
  let sessionId;
  let bookingId;

  before(async () => {
    await User.deleteMany({ email: /testbooking/i });
    await Booking.deleteMany({});

    // Member
    const memberReg = await chai.request(app).post('/api/auth/register')
      .send({ name: 'Member', email: 'testbooking-member@example.com', password: 'Member1234' });
    memberToken = memberReg.body.token;
    const memberId = memberReg.body._id;

    // Admin
    const adminReg = await chai.request(app).post('/api/auth/register')
      .send({ name: 'Admin', email: 'testbooking-admin@example.com', password: 'Admin1234' });
    await User.findByIdAndUpdate(adminReg.body._id, { role: 'admin' });
    const adminLogin = await chai.request(app).post('/api/auth/login')
      .send({ email: 'testbooking-admin@example.com', password: 'Admin1234' });
    adminToken = adminLogin.body.token;

    // Give member an active membership
    const plan = await MembershipPlan.create({ name: 'Test Plan', price: 50, durationDays: 30 });
    const start = new Date();
    const end = new Date(); end.setDate(end.getDate() + 30);
    await Membership.create({ user: memberId, plan: plan._id, startDate: start, endDate: end, status: 'active' });

    // Create venue + session
    const venue = await Venue.create({ name: 'Booking Test Venue', address: '1 St', suburb: 'Brisbane', state: 'QLD', capacity: 20 });
    const futureDate = new Date(); futureDate.setDate(futureDate.getDate() + 5);
    const session = await Session.create({ title: 'Booking Test Session', type: 'Hatha', instructor: 'Jane', venue: venue._id, date: futureDate, startTime: '09:00', duration: 60, capacity: 5 });
    sessionId = session._id.toString();
  });

  describe('POST /api/bookings', () => {
    it('should allow a member with active membership to book a session', async () => {
      const res = await chai.request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ sessionId });

      expect(res).to.have.status(201);
      expect(res.body.status).to.equal('confirmed');
      bookingId = res.body._id;
    });

    it('should prevent duplicate bookings', async () => {
      const res = await chai.request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ sessionId });

      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('Already booked this session');
    });

    it('should return 401 without authentication', async () => {
      const res = await chai.request(app).post('/api/bookings').send({ sessionId });
      expect(res).to.have.status(401);
    });
  });

  describe('GET /api/bookings/my', () => {
    it('should return the member\'s bookings', async () => {
      const res = await chai.request(app)
        .get('/api/bookings/my')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.be.at.least(1);
    });
  });

  describe('GET /api/bookings', () => {
    it('should allow admin to view all bookings', async () => {
      const res = await chai.request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
    });

    it('should return 403 for non-admin', async () => {
      const res = await chai.request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res).to.have.status(403);
    });
  });

  describe('PUT /api/bookings/:id/cancel', () => {
    it('should allow member to cancel their booking', async () => {
      const res = await chai.request(app)
        .put(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res).to.have.status(200);
      expect(res.body.message).to.equal('Booking cancelled');
    });

    it('should return 400 when cancelling an already-cancelled booking', async () => {
      const res = await chai.request(app)
        .put(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res).to.have.status(400);
    });
  });
});
