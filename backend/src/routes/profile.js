const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const UserRepository = require('../repositories/UserRepository');

const userRepo = new UserRepository();

// GET /api/profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await userRepo.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      id: user.id,
      email: user.email,
      weight: user.weight,
      heightCm: user.heightCm,
      age: user.age,
      gender: user.gender,
      level: user.level,
      goal: user.goal,
      activityLevel: user.activityLevel,
    });
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/profile
router.put('/', authMiddleware, async (req, res) => {
  try {
    const allowedFields = ['weight', 'heightCm', 'age', 'gender', 'level', 'goal', 'activityLevel'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await userRepo.update(req.user.id, updates);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      id: user.id,
      email: user.email,
      weight: user.weight,
      heightCm: user.heightCm,
      age: user.age,
      gender: user.gender,
      level: user.level,
      goal: user.goal,
      activityLevel: user.activityLevel,
    });
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
