const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const WorkoutService = require('../services/WorkoutService');

const workoutService = new WorkoutService();

// POST /api/workouts
router.post('/', authMiddleware, async (req, res) => {
  try {
    const workout = await workoutService.create(req.user.id, req.body);
    res.status(201).json(workout);
  } catch (error) {
    if (error.message.includes('requires')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/workouts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { type, from, to } = req.query;
    const workouts = await workoutService.findByUser(req.user.id, { type, from, to });
    res.json(workouts);
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/workouts/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const workout = await workoutService.findById(req.params.id);
    if (workout.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    res.json(workout);
  } catch (error) {
    if (error.message === 'Workout not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/workouts/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const workout = await workoutService.update(req.params.id, req.user.id, req.body);
    res.json(workout);
  } catch (error) {
    if (error.message === 'Workout not found') return res.status(404).json({ error: error.message });
    if (error.message === 'Unauthorized') return res.status(403).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/workouts/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await workoutService.delete(req.params.id, req.user.id);
    res.status(204).send();
  } catch (error) {
    if (error.message === 'Workout not found') return res.status(404).json({ error: error.message });
    if (error.message === 'Unauthorized') return res.status(403).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/workouts/:id/complete
router.post('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const workout = await workoutService.complete(req.params.id, req.user.id);
    res.json(workout);
  } catch (error) {
    if (error.message === 'Workout not found') return res.status(404).json({ error: error.message });
    if (error.message === 'Unauthorized') return res.status(403).json({ error: error.message });
    if (error.message === 'Workout already completed') return res.status(400).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
