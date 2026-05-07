const express = require('express');
const router = express.Router();
const ExerciseRepository = require('../repositories/ExerciseRepository');

const exerciseRepo = new ExerciseRepository();

// GET /api/exercises
router.get('/', async (req, res) => {
  try {
    const { muscle, equipment, difficulty, category } = req.query;
    const exercises = await exerciseRepo.findWithFilters({
      muscle,
      equipment,
      difficulty,
      category,
    });
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/exercises/:id
router.get('/:id', async (req, res) => {
  try {
    const exercise = await exerciseRepo.findById(req.params.id);
    if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
