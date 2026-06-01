const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const User = require('../models/User');
const Venue = require('../models/Venue');

require('./helpers');

chai.use(chaiHttp);
const { expect } = chai;

describe('Venue API', () => {
  let adminToken;
  let memberToken;
  let venueId;

  before(async () => {
    await User.deleteMany({ email: /testvenue/i });
    await Venue.deleteMany({ name: /Test Venue/i });

    // Create admin
    const admin = await chai.request(app).post('/api/auth/register')
      .send({ name: 'Admin', email: 'testvenue-admin@example.com', password: 'Admin1234' });
    await User.findByIdAndUpdate(admin.body._id, { role: 'admin' });
    const adminLogin = await chai.request(app).post('/api/auth/login')
      .send({ email: 'testvenue-admin@example.com', password: 'Admin1234' });
    adminToken = adminLogin.body.token;

    // Create member
    const member = await chai.request(app).post('/api/auth/register')
      .send({ name: 'Member', email: 'testvenue-member@example.com', password: 'Member1234' });
    memberToken = member.body.token;
  });

  describe('POST /api/venues', () => {
    it('should allow admin to create a venue', async () => {
      const res = await chai.request(app)
        .post('/api/venues')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test Venue Brisbane', address: '123 Test St', suburb: 'Brisbane', state: 'QLD', capacity: 20 });

      expect(res).to.have.status(201);
      expect(res.body.name).to.equal('Test Venue Brisbane');
      venueId = res.body._id;
    });

    it('should return 403 for non-admin users', async () => {
      const res = await chai.request(app)
        .post('/api/venues')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ name: 'Unauthorised Venue', address: '1 St', suburb: 'Brisbane', state: 'QLD', capacity: 10 });

      expect(res).to.have.status(403);
    });
  });

  describe('GET /api/venues', () => {
    it('should return list of active venues (public)', async () => {
      const res = await chai.request(app).get('/api/venues');
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('GET /api/venues/:id', () => {
    it('should return a venue by ID', async () => {
      const res = await chai.request(app).get(`/api/venues/${venueId}`);
      expect(res).to.have.status(200);
      expect(res.body._id).to.equal(venueId);
    });

    it('should return 404 for invalid ID', async () => {
      const res = await chai.request(app).get('/api/venues/000000000000000000000000');
      expect(res).to.have.status(404);
    });
  });

  describe('PUT /api/venues/:id', () => {
    it('should allow admin to update a venue', async () => {
      const res = await chai.request(app)
        .put(`/api/venues/${venueId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ capacity: 30 });

      expect(res).to.have.status(200);
      expect(res.body.capacity).to.equal(30);
    });
  });

  describe('DELETE /api/venues/:id', () => {
    it('should allow admin to deactivate a venue', async () => {
      const res = await chai.request(app)
        .delete(`/api/venues/${venueId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body.message).to.equal('Venue deactivated');
    });
  });
});
