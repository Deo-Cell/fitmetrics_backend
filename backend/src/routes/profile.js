const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const profileController = require('../controllers/ProfileController');

// GET /api/profile
router.get('/', authMiddleware, profileController.getProfile);

// PUT /api/profile
router.put('/', authMiddleware, profileController.updateProfile);

module.exports = router;
