const request = require('supertest');
const app = require('../../src/app');
const dbConnection = require('../../src/config/db');
const { seedExercises } = require('../../src/utils/seed');

describe('Stats Integration Extra Tests', () => {
  let token;
  let exerciseId;
  let workoutId;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const sequelize = dbConnection.getSequelize();
    await sequelize.sync({ force: true });
    
    await seedExercises();
    const { Exercise } = require('../../src/models');
    const ex = await Exercise.findOne({ where: { name: 'Développé couché barre' } });
    exerciseId = ex.id;

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'stats2@example.com', password: 'password123' });
    token = res.body.token;

    // Create a workout with sets to generate volume and personal records
    const resW = await request(app)
      .post('/api/workouts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Heavy Session',
        type: 'strength',
        exercises: [
          { exerciseId, type: 'strength', sets: [{ weight: 100, reps: 5 }, { weight: 105, reps: 3 }] }
        ]
      });
    workoutId = resW.body.id;

    // Complete the workout
    await request(app)
      .post(`/api/workouts/${workoutId}/complete`)
      .set('Authorization', `Bearer ${token}`);
  });

  describe('GET /api/stats/personal-records', () => {
    test('should return personal records for user', async () => {
      const res = await request(app)
        .get('/api/stats/personal-records')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('bestWeight');
        expect(res.body[0]).toHaveProperty('estimated1RM');
      }
    });
  });

  describe('GET /api/stats/volume-history', () => {
    test('should return volume history points', async () => {
      const res = await request(app)
        .get('/api/stats/volume-history?months=3')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('points');
      expect(Array.isArray(res.body.points)).toBe(true);
    });
  });

  describe('GET /api/stats/volume', () => {
    test('should return volume with delta when from and to are provided', async () => {
      const from = new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0];
      const to = new Date().toISOString().split('T')[0];
      const res = await request(app)
        .get(`/api/stats/volume?from=${from}&to=${to}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('deltaVolume');
      expect(res.body).toHaveProperty('deltaSets');
      expect(res.body).toHaveProperty('deltaReps');
    });
  });

  describe('GET /api/stats/volume-daily', () => {
    test('should return daily volume data for default period (week)', async () => {
      const res = await request(app)
        .get('/api/stats/volume-daily')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('days');
      expect(res.body).toHaveProperty('totalVolume');
    });

    test('should return daily volume data for month period', async () => {
      const res = await request(app)
        .get('/api/stats/volume-daily?period=month')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('days');
    });

    test('should return daily volume data for custom period', async () => {
      const from = new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0];
      const to = new Date().toISOString().split('T')[0];
      const res = await request(app)
        .get(`/api/stats/volume-daily?from=${from}&to=${to}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('days');
    });
  });
});
