const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const nutritionController = require('../controllers/NutritionController');

// GET /api/nutrition/bmi
router.get('/bmi', authMiddleware, nutritionController.getBmi);

// GET /api/nutrition/tdee
router.get('/tdee', authMiddleware, nutritionController.getTdee);

// GET /api/nutrition/calories-burned
router.get('/calories-burned', authMiddleware, nutritionController.getCaloriesBurned);

module.exports = router;
