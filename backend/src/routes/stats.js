const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const StatsService = require('../services/StatsService');

const statsService = new StatsService();

// GET /api/stats/personal-records
router.get('/personal-records', authMiddleware, async (req, res) => {
  try {
    const records = await statsService.getPersonalRecords(req.user.id);
    res.json(records);
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/stats/volume
router.get('/volume', authMiddleware, async (req, res) => {
  try {
    const { from, to } = req.query;
    const volume = await statsService.getVolume(req.user.id, { from, to });
    res.json(volume);
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/stats/dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const dashboard = await statsService.getDashboard(req.user.id);
    res.json(dashboard);
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
