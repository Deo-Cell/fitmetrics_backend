const request = require('supertest');
const app = require('../../src/app');
const dbConnection = require('../../src/config/db');
const { seedExercises } = require('../../src/utils/seed');

describe('Workouts & Profile Integration Tests', () => {
  let token;
  let userId;
  let exerciseId;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const sequelize = dbConnection.getSequelize();
    await sequelize.sync({ force: true });
    
    // Seed exercises
    await seedExercises();
    const { Exercise } = require('../../src/models');
    const ex = await Exercise.findOne({ where: { name: 'Développé couché barre' } });
    exerciseId = ex.id;

    // Create user and get token
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', password: 'password123' });
    
    token = res.body.token;
    userId = res.body.id;
  });

  describe('Profile', () => {
    test('should update user data when sending valid profile via PUT /api/profile', async () => {
      const profileData = {
        weight: 85,
        heightCm: 185,
        age: 25,
        gender: 'male',
        activityLevel: 'active'
      };

      const res = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(profileData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.weight).toBe(85);
      expect(res.body.activityLevel).toBe('active');
    });

    test('should return current profile data when calling GET /api/profile', async () => {
      const res = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.weight).toBe(85);
    });
  });

  describe('Workouts', () => {
    let workoutId;

    test('should create a session with sets when posting valid workout data', async () => {
      const workoutData = {
        name: 'My First Session',
        type: 'strength',
        exercises: [
          {
            exerciseId: exerciseId,
            type: 'strength',
            sets: [
              { weight: 60, reps: 10 },
              { weight: 65, reps: 8 }
            ]
          }
        ]
      };

      const res = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${token}`)
        .send(workoutData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('My First Session');
      expect(res.body.exercises.length).toBe(2); // 2 sets
      workoutId = res.body.id;
    });

    test('should finish the session when calling POST /api/workouts/:id/complete', async () => {
      const res = await request(app)
        .post(`/api/workouts/${workoutId}/complete`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('completed');
      expect(res.body.completedAt).not.toBeNull();
    });

    test('should return 404 when getting non-existent workout', async () => {
      const res = await request(app)
        .get('/api/workouts/99999')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(404);
    });

    test('should return 400 when creating workout without required fields', async () => {
      const res = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.statusCode).toBe(400);
    });
  });

  describe('Nutrition / TDEE', () => {
    test('should calculate TDEE values when calling GET /api/nutrition/tdee', async () => {
      const res = await request(app)
        .get('/api/nutrition/tdee')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('bmr');
      expect(res.body).toHaveProperty('tdee');
    });
  });
});
