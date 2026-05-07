const BaseRepository = require('./BaseRepository');
const { Workout, WorkoutExercise, Exercise } = require('../models');
const { Op } = require('sequelize');

class WorkoutRepository extends BaseRepository {
  constructor() {
    super(Workout);
  }

  /**
   * Trouver les séances d'un utilisateur avec filtres optionnels
   */
  async findByUser(userId, { type, from, to } = {}) {
    const where = { userId };

    if (type) where.type = type;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }

    return this.findAll({
      where,
      include: [{
        model: WorkoutExercise,
        as: 'exercises',
        include: [{ model: Exercise, as: 'exercise' }],
      }],
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Trouver une séance par ID avec tous les exercices détaillés
   */
  async findByIdWithExercises(id) {
    return this.model.findByPk(id, {
      include: [{
        model: WorkoutExercise,
        as: 'exercises',
        include: [{ model: Exercise, as: 'exercise' }],
      }],
    });
  }

  /**
   * Trouver les séances complétées d'un utilisateur (pour les stats)
   */
  async findCompletedByUser(userId, { from, to } = {}) {
    const where = { userId, status: 'completed' };

    if (from || to) {
      where.completedAt = {};
      if (from) where.completedAt[Op.gte] = new Date(from);
      if (to) where.completedAt[Op.lte] = new Date(to);
    }

    return this.findAll({
      where,
      include: [{
        model: WorkoutExercise,
        as: 'exercises',
        include: [{ model: Exercise, as: 'exercise' }],
      }],
      order: [['completedAt', 'DESC']],
    });
  }
}

module.exports = WorkoutRepository;
