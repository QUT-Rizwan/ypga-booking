const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const User = require('../models/User');

require('./helpers');

chai.use(chaiHttp);
const { expect } = chai;

describe('Auth API', () => {
  let token;

  before(async () => {
    await User.deleteMany({ email: /testauth/i });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return a token', async () => {
      const res = await chai.request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: 'testauth@example.com', password: 'Test1234' });

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('token');
      expect(res.body.email).to.equal('testauth@example.com');
      expect(res.body.role).to.equal('member');
      token = res.body.token;
    });

    it('should return 400 if user already exists', async () => {
      const res = await chai.request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: 'testauth@example.com', password: 'Test1234' });

      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await chai.request(app)
        .post('/api/auth/login')
        .send({ email: 'testauth@example.com', password: 'Test1234' });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('token');
      expect(res.body.email).to.equal('testauth@example.com');
    });

    it('should return 401 for wrong password', async () => {
      const res = await chai.request(app)
        .post('/api/auth/login')
        .send({ email: 'testauth@example.com', password: 'wrongpassword' });

      expect(res).to.have.status(401);
    });

    it('should return 401 for non-existent email', async () => {
      const res = await chai.request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'Test1234' });

      expect(res).to.have.status(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return profile for authenticated user', async () => {
      const res = await chai.request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res).to.have.status(200);
      expect(res.body.email).to.equal('testauth@example.com');
      expect(res.body).to.not.have.property('password');
    });

    it('should return 401 without token', async () => {
      const res = await chai.request(app).get('/api/auth/profile');
      expect(res).to.have.status(401);
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update the user profile', async () => {
      const res = await chai.request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name', phone: '0400000000' });

      expect(res).to.have.status(200);
      expect(res.body.name).to.equal('Updated Name');
      expect(res.body.phone).to.equal('0400000000');
    });
  });
});
