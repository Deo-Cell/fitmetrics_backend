const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const ExerciseRepository = require('../repositories/ExerciseRepository');

const exerciseRepo = new ExerciseRepository();

// POST /api/exercises
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, category, muscleGroup, equipment, difficulty, description } = req.body;
    if (!name || !category || !muscleGroup) {
      return res.status(400).json({ error: 'name, category and muscleGroup are required' });
    }

    const validCategories = ['strength', 'cardio', 'stretching', 'hiit', 'bodyweight'];
    const validMuscles = ['chest', 'back', 'shoulders', 'arms', 'legs', 'abs', 'full_body'];
    const validEquipment = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell', 'none'];
    const validDifficulty = ['beginner', 'intermediate', 'advanced'];

    if (!validCategories.includes(category)) return res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
    if (!validMuscles.includes(muscleGroup)) return res.status(400).json({ error: `Invalid muscleGroup. Must be one of: ${validMuscles.join(', ')}` });

    const exercise = await exerciseRepo.create({
      name,
      category,
      muscleGroup,
      equipment: validEquipment.includes(equipment) ? equipment : 'none',
      difficulty: validDifficulty.includes(difficulty) ? difficulty : 'beginner',
      description: description || null,
      metValue: 6.0,
    });
    res.status(201).json(exercise);
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/exercises/:id
router.get('/:id', async (req, res) => {
  try {
    const exercise = await exerciseRepo.findById(req.params.id);
    if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
    res.json(exercise);
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
