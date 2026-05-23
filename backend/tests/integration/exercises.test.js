const request = require('supertest');
const app = require('../../src/app');
const dbConnection = require('../../src/config/db');

describe('Exercises Integration Tests', () => {
  let token;
  let exerciseId;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const sequelize = dbConnection.getSequelize();
    await sequelize.sync({ force: true });

    // Create user and get token
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'exercises@example.com', password: 'password123' });
    
    token = res.body.token;
  });

  describe('POST /api/exercises', () => {
    test('should return 400 when creating exercise without required fields', async () => {
      const res = await request(app)
        .post('/api/exercises')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test' });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('are required');
    });

    test('should return 400 when category is invalid', async () => {
      const res = await request(app)
        .post('/api/exercises')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test', category: 'invalid', muscleGroup: 'chest' });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Invalid category');
    });

    test('should return 400 when muscleGroup is invalid', async () => {
      const res = await request(app)
        .post('/api/exercises')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test', category: 'strength', muscleGroup: 'invalid' });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Invalid muscleGroup');
    });

    test('should create exercise successfully when given valid data', async () => {
      const res = await request(app)
        .post('/api/exercises')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'My Custom Exercise',
          category: 'strength',
          muscleGroup: 'back',
          equipment: 'invalid_equipment', // should default to none
          difficulty: 'invalid_diff' // should default to beginner
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('My Custom Exercise');
      expect(res.body.equipment).toBe('none');
      expect(res.body.difficulty).toBe('beginner');
      exerciseId = res.body.id;
    });
  });

  describe('GET /api/exercises/:id', () => {
    test('should return exercise details when given valid id', async () => {
      const res = await request(app)
        .get(`/api/exercises/${exerciseId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('My Custom Exercise');
    });

    test('should return 404 when exercise does not exist', async () => {
      const res = await request(app)
        .get('/api/exercises/99999')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(404);
    });
  });
});
