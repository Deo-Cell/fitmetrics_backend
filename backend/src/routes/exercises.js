const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const exerciseController = require('../controllers/ExerciseController');

// POST /api/exercises
router.post('/', authMiddleware, exerciseController.create);

// GET /api/exercises
router.get('/', exerciseController.getAll);

// GET /api/exercises/:id
router.get('/:id', exerciseController.getById);

module.exports = router;
