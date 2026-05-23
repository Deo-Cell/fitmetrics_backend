const WorkoutService = require('../services/WorkoutService');
const StatsService = require('../services/StatsService');
const logger = require('../config/logger');

class WorkoutController {
  constructor() {
    this.workoutService = new WorkoutService();
    
    // Observer Pattern — recalcul asynchrone des stats après complétion d'une séance
    this.workoutService.on('workout:completed', async ({ workout, userId }) => {
      try {
        const statsService = new StatsService();
        await statsService.getDashboard(userId);
        logger.info('Stats recalculated after workout completion', { workoutId: workout.id, userId });
      } catch (error) {
        logger.error('Failed to recalculate stats after workout completion', error);
      }
    });
  }

  create = async (req, res) => {
    try {
      if (!req.body.name) {
        return res.status(400).json({ error: 'Workout name is required' });
      }
      const workout = await this.workoutService.create(req.user.id, req.body);
      res.status(201).json(workout);
    } catch (error) {
      if (error.message.includes('requires')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getAll = async (req, res) => {
    try {
      const { type, from, to } = req.query;
      const workouts = await this.workoutService.findByUser(req.user.id, { type, from, to });
      res.json(workouts);
    } catch (_error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getById = async (req, res) => {
    try {
      const workout = await this.workoutService.findById(req.params.id);
      if (workout.userId !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      res.json(workout);
    } catch (error) {
      if (error.message === 'Workout not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  update = async (req, res) => {
    try {
      const workout = await this.workoutService.update(req.params.id, req.user.id, req.body);
      res.json(workout);
    } catch (error) {
      if (error.message === 'Workout not found') return res.status(404).json({ error: error.message });
      if (error.message === 'Unauthorized') return res.status(403).json({ error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  delete = async (req, res) => {
    try {
      await this.workoutService.delete(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      if (error.message === 'Workout not found') return res.status(404).json({ error: error.message });
      if (error.message === 'Unauthorized') return res.status(403).json({ error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  complete = async (req, res) => {
    try {
      const workout = await this.workoutService.complete(req.params.id, req.user.id);
      res.json(workout);
    } catch (error) {
      if (error.message === 'Workout not found') return res.status(404).json({ error: error.message });
      if (error.message === 'Unauthorized') return res.status(403).json({ error: error.message });
      if (error.message === 'Workout already completed') return res.status(400).json({ error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

module.exports = new WorkoutController();
