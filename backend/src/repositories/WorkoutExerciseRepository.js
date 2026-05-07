const BaseRepository = require('./BaseRepository');
const { WorkoutExercise, Exercise } = require('../models');

class WorkoutExerciseRepository extends BaseRepository {
  constructor() {
    super(WorkoutExercise);
  }

  /**
   * Créer plusieurs sets d'un coup (bulk insert)
   */
  async bulkCreate(sets) {
    return WorkoutExercise.bulkCreate(sets);
  }

  /**
   * Trouver tous les sets d'un workout
   */
  async findByWorkout(workoutId) {
    return this.findAll({
      where: { workoutId },
      include: [{ model: Exercise, as: 'exercise' }],
      order: [['exerciseId', 'ASC'], ['setNumber', 'ASC']],
    });
  }

  /**
   * Supprimer tous les sets d'un workout
   */
  async deleteByWorkout(workoutId) {
    return WorkoutExercise.destroy({ where: { workoutId } });
  }

  /**
   * Trouver le meilleur poids soulevé par exercice pour un utilisateur
   * (pour les Personal Records)
   */
  async findPersonalRecords(userId) {
    const { Workout } = require('../models');
    
    return this.findAll({
      attributes: ['exerciseId', 'weight', 'reps'],
      include: [
        {
          model: Exercise,
          as: 'exercise',
          attributes: ['name', 'category'],
        },
        {
          model: Workout,
          as: 'workout',
          attributes: [],
          where: { userId, status: 'completed' },
        },
      ],
      where: {
        weight: { [require('sequelize').Op.not]: null },
      },
      order: [['weight', 'DESC']],
    });
  }
}

module.exports = WorkoutExerciseRepository;
