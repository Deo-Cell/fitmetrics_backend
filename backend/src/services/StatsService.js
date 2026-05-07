const WorkoutRepository = require('../repositories/WorkoutRepository');
const WorkoutExerciseRepository = require('../repositories/WorkoutExerciseRepository');
const { RMCalculator, Epley1RMStrategy } = require('../strategies/calculator/Calculators');


class StatsService {
  constructor(workoutRepo, workoutExerciseRepo, rmCalculator) {
    this.workoutRepo = workoutRepo || new WorkoutRepository();
    this.workoutExerciseRepo = workoutExerciseRepo || new WorkoutExerciseRepository();
    this.rmCalculator = rmCalculator || new RMCalculator(new Epley1RMStrategy());
  }

  /**
   * Récupérer les records personnels (meilleur poids par exercice)
   */
  async getPersonalRecords(userId) {
    const records = await this.workoutExerciseRepo.findPersonalRecords(userId);

    // Grouper par exercice et garder le meilleur
    const prMap = new Map();
    for (const record of records) {
      const key = record.exerciseId;
      const estimated1RM = this.rmCalculator.calculate1RM(record.weight, record.reps);

      if (!prMap.has(key) || estimated1RM > prMap.get(key).estimated1RM) {
        prMap.set(key, {
          exerciseId: record.exerciseId,
          exerciseName: record.exercise.name,
          bestWeight: record.weight,
          bestReps: record.reps,
          estimated1RM,
        });
      }
    }

    return Array.from(prMap.values());
  }

  /**
   * Calculer le volume total (tonnage) sur une période
   * Volume = Σ (poids × reps) pour chaque set de chaque séance complétée
   */
  async getVolume(userId, { from, to } = {}) {
    const workouts = await this.workoutRepo.findCompletedByUser(userId, { from, to });

    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;

    for (const workout of workouts) {
      for (const exerciseSet of workout.exercises) {
        if (exerciseSet.weight && exerciseSet.reps) {
          totalVolume += exerciseSet.weight * exerciseSet.reps;
          totalSets += 1;
          totalReps += exerciseSet.reps;
        }
      }
    }

    return {
      totalVolume: Math.round(totalVolume * 10) / 10,
      totalVolumeKg: `${(totalVolume / 1000).toFixed(1)}T`,
      totalSets,
      totalReps,
      workoutCount: workouts.length,
      period: { from: from || 'all time', to: to || 'now' },
    };
  }

  /**
   * Dashboard résumé global
   */
  async getDashboard(userId) {
    const personalRecords = await this.getPersonalRecords(userId);

    const allWorkouts = await this.workoutRepo.findCompletedByUser(userId);

    // Calcul du streak (jours consécutifs d'entraînement)
    const streak = this.calculateStreak(allWorkouts);

    // Fréquence cette semaine
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekWorkouts = allWorkouts.filter(
      (w) => new Date(w.completedAt) >= oneWeekAgo
    );

    return {
      totalWorkouts: allWorkouts.length,
      thisWeekWorkouts: thisWeekWorkouts.length,
      currentStreak: streak,
      topRecords: personalRecords.slice(0, 5),
    };
  }

  /**
   * Calcul du streak (nombre de jours consécutifs d'entraînement)
   */
  calculateStreak(workouts) {
    if (workouts.length === 0) return 0;

    // Extraire les dates uniques de séances complétées
    const dates = [
      ...new Set(
        workouts
          .filter((w) => w.completedAt)
          .map((w) => new Date(w.completedAt).toISOString().split('T')[0])
      ),
    ].sort().reverse();

    if (dates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Le streak doit commencer aujourd'hui ou hier
    if (dates[0] !== today && dates[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 0; i < dates.length - 1; i++) {
      const current = new Date(dates[i]);
      const previous = new Date(dates[i + 1]);
      const diffDays = (current - previous) / 86400000;

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}

module.exports = StatsService;
