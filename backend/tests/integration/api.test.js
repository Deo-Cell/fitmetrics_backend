const request = require('supertest');
const app = require('../../src/app');
const dbConnection = require('../../src/config/db');

describe('API Integration Tests', () => {
  
  beforeAll(async () => {
    // Synchroniser la base SQLite en mémoire avant les tests
    process.env.NODE_ENV = 'test';
    const sequelize = dbConnection.getSequelize();
    await sequelize.sync({ force: true });
  });

  describe('Health Check', () => {
    test('should return 200 with healthy status when calling GET /health', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.database).toBe('connected');
    });
  });

  describe('Auth Routes', () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123'
    };

    test('should create a new user when registering with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe(userData.email);
      expect(res.body).toHaveProperty('token');
    });

    test('should return 409 when registering with duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      expect(res.statusCode).toBe(409);
      expect(res.body.error).toBe('Email already registered');
    });

    test('should return 400 when registering without email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ password: 'Test1234!' });
      expect(res.statusCode).toBe(400);
    });

    test('should return token when logging in with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send(userData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    test('should return 401 when logging in with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: 'wrongpassword' });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });
  });
});
