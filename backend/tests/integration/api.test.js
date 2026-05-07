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
    test('GET /health should return 200 and healthy status', async () => {
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

    test('POST /api/auth/register should create a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe(userData.email);
      expect(res.body).toHaveProperty('token');
    });

    test('POST /api/auth/register should fail for existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      expect(res.statusCode).toBe(409);
      expect(res.body.error).toBe('Email already registered');
    });

    test('POST /api/auth/login should return token for valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send(userData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    test('POST /api/auth/login should fail for invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: 'wrongpassword' });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });
  });
});
