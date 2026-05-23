const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const workoutController = require('../controllers/WorkoutController');

// POST /api/workouts
router.post('/', authMiddleware, workoutController.create);

// GET /api/workouts
router.get('/', authMiddleware, workoutController.getAll);

// GET /api/workouts/:id
router.get('/:id', authMiddleware, workoutController.getById);

// PUT /api/workouts/:id
router.put('/:id', authMiddleware, workoutController.update);

// DELETE /api/workouts/:id
router.delete('/:id', authMiddleware, workoutController.delete);

// POST /api/workouts/:id/complete
router.post('/:id/complete', authMiddleware, workoutController.complete);

module.exports = router;
