const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const User = require('../models/User');
const Venue = require('../models/Venue');
const Session = require('../models/Session');

require('./helpers');

chai.use(chaiHttp);
const { expect } = chai;

describe('Session API', () => {
  let adminToken;
  let sessionId;
  let venueId;

  before(async () => {
    await User.deleteMany({ email: /testsession/i });
    await Session.deleteMany({ title: /Test Session/i });

    // Admin setup
    const reg = await chai.request(app).post('/api/auth/register')
      .send({ name: 'Admin', email: 'testsession-admin@example.com', password: 'Admin1234' });
    await User.findByIdAndUpdate(reg.body._id, { role: 'admin' });
    const login = await chai.request(app).post('/api/auth/login')
      .send({ email: 'testsession-admin@example.com', password: 'Admin1234' });
    adminToken = login.body.token;

    // Venue
    const venue = await Venue.create({ name: 'Session Test Venue', address: '1 Test', suburb: 'Brisbane', state: 'QLD', capacity: 20 });
    venueId = venue._id.toString();
  });

  const futureDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  describe('POST /api/sessions', () => {
    it('should allow admin to create a session', async () => {
      const res = await chai.request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Test Session Hatha', type: 'Hatha', instructor: 'Jane', venue: venueId, date: futureDate(), startTime: '09:00', duration: 60, capacity: 15 });

      expect(res).to.have.status(201);
      expect(res.body.title).to.equal('Test Session Hatha');
      sessionId = res.body._id;
    });

    it('should create recurring sessions', async () => {
      const startDate = futureDate();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 28);

      const res = await chai.request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Test Session Recurring', type: 'Vinyasa', instructor: 'Bob', venue: venueId, date: startDate, startTime: '10:00', duration: 45, capacity: 10, isRecurring: true, recurringEndDate: endDate.toISOString().split('T')[0] });

      expect(res).to.have.status(201);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.be.at.least(2);
    });
  });

  describe('GET /api/sessions', () => {
    it('should return upcoming sessions (public)', async () => {
      const res = await chai.request(app).get('/api/sessions');
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
    });

    it('should filter by venue', async () => {
      const res = await chai.request(app).get(`/api/sessions?venue=${venueId}`);
      expect(res).to.have.status(200);
      res.body.forEach(s => expect(s.venue._id || s.venue).to.equal(venueId));
    });
  });

  describe('PUT /api/sessions/:id', () => {
    it('should allow admin to update a session', async () => {
      const res = await chai.request(app)
        .put(`/api/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ capacity: 20 });

      expect(res).to.have.status(200);
      expect(res.body.capacity).to.equal(20);
    });
  });

  describe('DELETE /api/sessions/:id', () => {
    it('should allow admin to cancel a session', async () => {
      const res = await chai.request(app)
        .delete(`/api/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body.message).to.equal('Session cancelled');
    });
  });
});
