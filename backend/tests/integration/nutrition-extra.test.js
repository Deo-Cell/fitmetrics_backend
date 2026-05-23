const request = require('supertest');
const app = require('../../src/app');
const dbConnection = require('../../src/config/db');

describe('Nutrition Integration Extra Tests', () => {
  let tokenFull;
  let tokenEmpty;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const sequelize = dbConnection.getSequelize();
    await sequelize.sync({ force: true });

    // Create user with profile
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ email: 'full@example.com', password: 'password123' });
    tokenFull = res1.body.token;

    await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${tokenFull}`)
      .send({ weight: 80, heightCm: 180, age: 30, gender: 'male', activityLevel: 'active' });

    // Create user without profile
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({ email: 'empty@example.com', password: 'password123' });
    tokenEmpty = res2.body.token;
  });

  describe('GET /api/nutrition/bmi', () => {
    test('should return 400 when profile is missing weight or height', async () => {
      const res = await request(app)
        .get('/api/nutrition/bmi')
        .set('Authorization', `Bearer ${tokenEmpty}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Profile must include weight and height');
    });

    test('should return BMI data when profile is complete', async () => {
      const res = await request(app)
        .get('/api/nutrition/bmi')
        .set('Authorization', `Bearer ${tokenFull}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('bmi');
    });
  });

  describe('GET /api/nutrition/tdee', () => {
    test('should return 400 when profile is incomplete for TDEE', async () => {
      const res = await request(app)
        .get('/api/nutrition/tdee')
        .set('Authorization', `Bearer ${tokenEmpty}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Complete profile required');
    });
  });

  describe('GET /api/nutrition/calories-burned', () => {
    test('should return 400 when profile is missing weight', async () => {
      const res = await request(app)
        .get('/api/nutrition/calories-burned?duration=30')
        .set('Authorization', `Bearer ${tokenEmpty}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Profile must include weight');
    });

    test('should return 400 when duration is missing', async () => {
      const res = await request(app)
        .get('/api/nutrition/calories-burned')
        .set('Authorization', `Bearer ${tokenFull}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Duration (in minutes) is required');
    });

    test('should return calories burned when given valid data', async () => {
      const res = await request(app)
        .get('/api/nutrition/calories-burned?duration=60&type=strength')
        .set('Authorization', `Bearer ${tokenFull}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('caloriesBurned');
    });
  });
});
