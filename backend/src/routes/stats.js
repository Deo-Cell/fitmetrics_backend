const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const statsController = require('../controllers/StatsController');

// GET /api/stats/personal-records
router.get('/personal-records', authMiddleware, statsController.getPersonalRecords);

// GET /api/stats/volume
router.get('/volume', authMiddleware, statsController.getVolume);

// GET /api/stats/volume-history
router.get('/volume-history', authMiddleware, statsController.getVolumeHistory);

// GET /api/stats/volume-daily
router.get('/volume-daily', authMiddleware, statsController.getVolumeDaily);

// GET /api/stats/dashboard
router.get('/dashboard', authMiddleware, statsController.getDashboard);

module.exports = router;
