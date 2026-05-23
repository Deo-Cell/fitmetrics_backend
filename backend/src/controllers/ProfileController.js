const UserRepository = require('../repositories/UserRepository');

class ProfileController {
  constructor() {
    this.userRepo = new UserRepository();
  }

  getProfile = async (req, res) => {
    try {
      const user = await this.userRepo.findById(req.user.id);
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
  };

  updateProfile = async (req, res) => {
    try {
      const allowedFields = ['weight', 'heightCm', 'age', 'gender', 'level', 'goal', 'activityLevel'];
      const updates = {};

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      const user = await this.userRepo.update(req.user.id, updates);
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
  };
}

module.exports = new ProfileController();
