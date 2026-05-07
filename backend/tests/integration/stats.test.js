const request = require('supertest');
const app = require('../../src/app');
const dbConnection = require('../../src/config/db');
const { seedExercises } = require('../../src/utils/seed');

describe('Stats & Exercises Integration Tests', () => {
  let token;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const sequelize = dbConnection.getSequelize();
    await sequelize.sync({ force: true });
    await seedExercises();

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'stats@example.com', password: 'password123' });
    token = res.body.token;
  });

  describe('Exercises', () => {
    test('GET /api/exercises should return full list', async () => {
      const res = await request(app).get('/api/exercises');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    test('GET /api/exercises?muscle=chest should filter results', async () => {
      const res = await request(app).get('/api/exercises?muscle=chest');
      expect(res.statusCode).toBe(200);
      res.body.forEach(ex => expect(ex.muscleGroup).toBe('chest'));
    });
  });

  describe('Stats', () => {
    test('GET /api/stats/dashboard should return summary', async () => {
      const res = await request(app)
        .get('/api/stats/dashboard')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('totalWorkouts');
      expect(res.body).toHaveProperty('currentStreak');
    });

    test('GET /api/stats/volume should return volume data', async () => {
      const res = await request(app)
        .get('/api/stats/volume')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('totalVolume');
    });
  });
});
