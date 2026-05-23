const request = require('supertest');
const app = require('../../src/app');
const dbConnection = require('../../src/config/db');
const { seedExercises } = require('../../src/utils/seed');

describe('Workouts Integration Extra Tests', () => {
  let token1, userId1;
  let token2, userId2;
  let workoutId;
  let exerciseId;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const sequelize = dbConnection.getSequelize();
    await sequelize.sync({ force: true });
    
    await seedExercises();
    const { Exercise } = require('../../src/models');
    const ex = await Exercise.findOne({ where: { name: 'Développé couché barre' } });
    exerciseId = ex.id;

    // User 1
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user1@example.com', password: 'password123' });
    token1 = res1.body.token;
    userId1 = res1.body.id;

    // User 2
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user2@example.com', password: 'password123' });
    token2 = res2.body.token;
    userId2 = res2.body.id;

    // Create a workout for User 1
    const resW = await request(app)
      .post('/api/workouts')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        name: 'Initial Workout',
        type: 'strength',
        exercises: [
          { exerciseId, type: 'strength', sets: [{ weight: 100, reps: 5 }] }
        ]
      });
    workoutId = resW.body.id;
  });

  describe('GET /api/workouts', () => {
    test('should return all workouts for user', async () => {
      const res = await request(app)
        .get('/api/workouts')
        .set('Authorization', `Bearer ${token1}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });
  });

  describe('GET /api/workouts/:id', () => {
    test('should return 403 when accessing another users workout', async () => {
      const res = await request(app)
        .get(`/api/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${token2}`);
      expect(res.statusCode).toBe(403);
    });
  });

  describe('PUT /api/workouts/:id', () => {
    test('should return 403 when updating another users workout', async () => {
      const res = await request(app)
        .put(`/api/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ name: 'Hacked' });
      expect(res.statusCode).toBe(403);
    });

    test('should update workout for owner', async () => {
      const res = await request(app)
        .put(`/api/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ name: 'Updated Workout' });
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Updated Workout');
    });

    test('should return 404 when updating non-existent workout', async () => {
      const res = await request(app)
        .put('/api/workouts/99999')
        .set('Authorization', `Bearer ${token1}`)
        .send({ name: 'Test' });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /api/workouts/:id/complete', () => {
    test('should complete the workout successfully', async () => {
      const res = await request(app)
        .post(`/api/workouts/${workoutId}/complete`)
        .set('Authorization', `Bearer ${token1}`);
      expect(res.statusCode).toBe(200);
    });

    test('should return 400 when completing an already completed workout', async () => {
      const res = await request(app)
        .post(`/api/workouts/${workoutId}/complete`)
        .set('Authorization', `Bearer ${token1}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Workout already completed');
    });

    test('should return 403 when completing another users workout', async () => {
      const res = await request(app)
        .post(`/api/workouts/${workoutId}/complete`)
        .set('Authorization', `Bearer ${token2}`);
      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/workouts/:id', () => {
    test('should return 403 when deleting another users workout', async () => {
      const res = await request(app)
        .delete(`/api/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${token2}`);
      expect(res.statusCode).toBe(403);
    });

    test('should delete workout for owner', async () => {
      const res = await request(app)
        .delete(`/api/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${token1}`);
      expect(res.statusCode).toBe(204);
    });

    test('should return 404 when deleting non-existent workout', async () => {
      const res = await request(app)
        .delete('/api/workouts/99999')
        .set('Authorization', `Bearer ${token1}`);
      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /api/workouts (errors)', () => {
    test('should return 400 when factory throws requires error', async () => {
      const res = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          name: 'Bad Workout',
          exercises: [{ exerciseId, type: 'strength', sets: [{ weight: 100 }] }] // Missing reps
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('requires');
    });
  });
});
