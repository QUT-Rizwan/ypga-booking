const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const User = require('../models/User');
const MembershipPlan = require('../models/MembershipPlan');
const Membership = require('../models/Membership');

require('./helpers');

chai.use(chaiHttp);
const { expect } = chai;

describe('Membership API', () => {
  let adminToken;
  let memberToken;
  let memberId;
  let planId;

  before(async () => {
    await User.deleteMany({ email: /testmembership/i });
    await MembershipPlan.deleteMany({ name: /Test Plan/i });

    // Admin
    const adminReg = await chai.request(app).post('/api/auth/register')
      .send({ name: 'Admin', email: 'testmembership-admin@example.com', password: 'Admin1234' });
    await User.findByIdAndUpdate(adminReg.body._id, { role: 'admin' });
    const adminLogin = await chai.request(app).post('/api/auth/login')
      .send({ email: 'testmembership-admin@example.com', password: 'Admin1234' });
    adminToken = adminLogin.body.token;

    // Member
    const memberReg = await chai.request(app).post('/api/auth/register')
      .send({ name: 'Member', email: 'testmembership-member@example.com', password: 'Member1234' });
    memberToken = memberReg.body.token;
    memberId = memberReg.body._id;
  });

  describe('POST /api/memberships/plans', () => {
    it('should allow admin to create a membership plan', async () => {
      const res = await chai.request(app)
        .post('/api/memberships/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test Plan Monthly', description: 'Full month access', price: 79, durationDays: 30 });

      expect(res).to.have.status(201);
      expect(res.body.name).to.equal('Test Plan Monthly');
      planId = res.body._id;
    });

    it('should return 403 for non-admin', async () => {
      const res = await chai.request(app)
        .post('/api/memberships/plans')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ name: 'Test Hack Plan', price: 0, durationDays: 365 });

      expect(res).to.have.status(403);
    });
  });

  describe('GET /api/memberships/plans', () => {
    it('should return active plans (public)', async () => {
      const res = await chai.request(app).get('/api/memberships/plans');
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.be.at.least(1);
    });
  });

  describe('POST /api/memberships/purchase', () => {
    it('should allow member to purchase a plan', async () => {
      const res = await chai.request(app)
        .post('/api/memberships/purchase')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ planId });

      expect(res).to.have.status(201);
      expect(res.body.status).to.equal('active');
      expect(res.body.plan._id).to.equal(planId);
    });

    it('should prevent purchasing when already active', async () => {
      const res = await chai.request(app)
        .post('/api/memberships/purchase')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ planId });

      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('You already have an active membership');
    });
  });

  describe('GET /api/memberships/my', () => {
    it('should return the member\'s current membership', async () => {
      const res = await chai.request(app)
        .get('/api/memberships/my')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res).to.have.status(200);
    });
  });

  describe('PUT /api/memberships/plans/:id', () => {
    it('should allow admin to update a plan', async () => {
      const res = await chai.request(app)
        .put(`/api/memberships/plans/${planId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 89 });

      expect(res).to.have.status(200);
      expect(res.body.price).to.equal(89);
    });
  });
});
