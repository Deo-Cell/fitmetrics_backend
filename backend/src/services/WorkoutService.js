const WorkoutRepository = require('../repositories/WorkoutRepository');
const WorkoutExerciseRepository = require('../repositories/WorkoutExerciseRepository');
const WorkoutSetFactory = require('../factories/WorkoutSetFactory');
const logger = require('../config/logger');
const EventEmitter = require('events');

/**
 * Observer Pattern — WorkoutService étend EventEmitter
 * Justification : Quand un workout est complété, on veut déclencher des effets 
 * secondaires (recalcul des stats, vérification de PR, notification) sans coupler
 * ces logiques. L'Observer permet d'ajouter/retirer des réactions sans modifier
 * ce service.
 */
class WorkoutService extends EventEmitter {
  constructor(workoutRepo, workoutExerciseRepo) {
    super();
    this.workoutRepo = workoutRepo || new WorkoutRepository();
    this.workoutExerciseRepo = workoutExerciseRepo || new WorkoutExerciseRepository();
  }

  async create(userId, workoutData) {
    const { exercises: exerciseSets, ...workoutFields } = workoutData;

    // Créer le workout
    const workout = await this.workoutRepo.create({
      ...workoutFields,
      userId,
    });

    // Créer les sets via la Factory
    if (exerciseSets && exerciseSets.length > 0) {
      const sets = [];
      for (const exerciseGroup of exerciseSets) {
        const { exerciseId, type, sets: rawSets } = exerciseGroup;
        rawSets.forEach((rawSet, index) => {
          const set = WorkoutSetFactory.create(type || 'strength', {
            ...rawSet,
            workoutId: workout.id,
            exerciseId,
            setNumber: index + 1,
          });
          sets.push(set);
        });
      }
      await this.workoutExerciseRepo.bulkCreate(sets);
    }

    logger.info('Workout created', { workoutId: workout.id, userId });

    return this.workoutRepo.findByIdWithExercises(workout.id);
  }

  async findByUser(userId, filters) {
    return this.workoutRepo.findByUser(userId, filters);
  }

  async findById(id) {
    const workout = await this.workoutRepo.findByIdWithExercises(id);
    if (!workout) throw new Error('Workout not found');
    return workout;
  }

  async update(id, userId, data) {
    const workout = await this.workoutRepo.findById(id);
    if (!workout) throw new Error('Workout not found');
    if (workout.userId !== userId) throw new Error('Unauthorized');

    const { exercises: exerciseSets, ...workoutFields } = data;

    await this.workoutRepo.update(id, workoutFields);

    // Si on met à jour les exercices, on supprime les anciens et on recrée
    if (exerciseSets) {
      await this.workoutExerciseRepo.deleteByWorkout(id);
      const sets = [];
      for (const exerciseGroup of exerciseSets) {
        const { exerciseId, type, sets: rawSets } = exerciseGroup;
        rawSets.forEach((rawSet, index) => {
          const set = WorkoutSetFactory.create(type || 'strength', {
            ...rawSet,
            workoutId: id,
            exerciseId,
            setNumber: index + 1,
          });
          sets.push(set);
        });
      }
      await this.workoutExerciseRepo.bulkCreate(sets);
    }

    logger.info('Workout updated', { workoutId: id, userId });

    return this.workoutRepo.findByIdWithExercises(id);
  }

  async delete(id, userId) {
    const workout = await this.workoutRepo.findById(id);
    if (!workout) throw new Error('Workout not found');
    if (workout.userId !== userId) throw new Error('Unauthorized');

    await this.workoutExerciseRepo.deleteByWorkout(id);
    await this.workoutRepo.delete(id);

    logger.info('Workout deleted', { workoutId: id, userId });
  }

  async complete(id, userId) {
    const workout = await this.workoutRepo.findById(id);
    if (!workout) throw new Error('Workout not found');
    if (workout.userId !== userId) throw new Error('Unauthorized');
    if (workout.status === 'completed') throw new Error('Workout already completed');

    await this.workoutRepo.update(id, {
      status: 'completed',
      completedAt: new Date(),
    });

    const completedWorkout = await this.workoutRepo.findByIdWithExercises(id);

    // Observer Pattern — émettre un événement pour déclencher les effets secondaires
    this.emit('workout:completed', { workout: completedWorkout, userId });

    logger.info('Workout completed', { workoutId: id, userId });

    return completedWorkout;
  }
}

module.exports = WorkoutService;
