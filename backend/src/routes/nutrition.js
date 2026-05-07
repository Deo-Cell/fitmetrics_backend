const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const NutritionService = require('../services/NutritionService');
const UserRepository = require('../repositories/UserRepository');

const nutritionService = new NutritionService();
const userRepo = new UserRepository();

// GET /api/nutrition/bmi
router.get('/bmi', authMiddleware, async (req, res) => {
  try {
    const user = await userRepo.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.weight || !user.heightCm) {
      return res.status(400).json({ error: 'Profile must include weight and height' });
    }

    const result = nutritionService.calculateBMI(user.weight, user.heightCm);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/nutrition/tdee
router.get('/tdee', authMiddleware, async (req, res) => {
  try {
    const result = await nutritionService.calculateTDEE(req.user.id);
    res.json(result);
  } catch (error) {
    if (error.message.includes('Complete profile required')) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/nutrition/calories-burned?workoutId=5
router.get('/calories-burned', authMiddleware, async (req, res) => {
  try {
    const user = await userRepo.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.weight) {
      return res.status(400).json({ error: 'Profile must include weight' });
    }

    const { duration, type } = req.query;
    if (!duration) {
      return res.status(400).json({ error: 'Duration (in minutes) is required' });
    }

    const result = nutritionService.calculateCaloriesBurned(
      user.weight,
      parseInt(duration),
      type || 'mixed'
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
