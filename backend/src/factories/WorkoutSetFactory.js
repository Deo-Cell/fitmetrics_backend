/**
 * Factory Pattern — WorkoutSet Factory
 * Justification : Une série de musculation et une série de cardio ont des champs
 * différents (poids/reps vs durée/distance). La Factory crée le bon objet selon
 * le type d'exercice, ce qui évite des if/else partout dans le code et garantit
 * la cohérence des données.
 */
class WorkoutSetFactory {
  /**
   * Crée un objet set correctement formaté selon le type
   * @param {'strength'|'cardio'} type - Le type d'exercice
   * @param {Object} data - Les données brutes du set
   * @returns {Object} Le set formaté et validé
   */
  static create(type, data) {
    switch (type) {
      case 'strength':
        return WorkoutSetFactory.createStrengthSet(data);
      case 'cardio':
        return WorkoutSetFactory.createCardioSet(data);
      default:
        return WorkoutSetFactory.createStrengthSet(data);
    }
  }

  static createStrengthSet(data) {
    if (!data.weight || !data.reps) {
      throw new Error('Strength set requires weight and reps');
    }
    if (data.weight <= 0 || data.reps <= 0) {
      throw new Error('Weight and reps must be positive');
    }

    return {
      workoutId: data.workoutId,
      exerciseId: data.exerciseId,
      setNumber: data.setNumber,
      weight: data.weight,
      reps: data.reps,
      duration: null,
      distance: null,
      completed: data.completed !== undefined ? data.completed : true,
    };
  }

  static createCardioSet(data) {
    if (!data.duration) {
      throw new Error('Cardio set requires duration');
    }
    if (data.duration <= 0) {
      throw new Error('Duration must be positive');
    }

    return {
      workoutId: data.workoutId,
      exerciseId: data.exerciseId,
      setNumber: data.setNumber,
      weight: null,
      reps: null,
      duration: data.duration,
      distance: data.distance || null,
      completed: data.completed !== undefined ? data.completed : true,
    };
  }
}

module.exports = WorkoutSetFactory;
