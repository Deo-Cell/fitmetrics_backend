const WorkoutRepository = require('../repositories/WorkoutRepository');
const WorkoutExerciseRepository = require('../repositories/WorkoutExerciseRepository');
const { RMCalculator, Epley1RMStrategy } = require('../strategies/calculator/Calculators');

const MS_PER_DAY = 86400000;

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

    // Grouper par exercice — garder le meilleur et le 2e meilleur pour le delta
    const prMap = new Map();
    for (const record of records) {
      const key = record.exerciseId;
      const estimated1RM = this.rmCalculator.calculate1RM(record.weight, record.reps);
      const entry = {
        exerciseId: record.exerciseId,
        exerciseName: record.exercise.name,
        muscleGroup: record.exercise.muscleGroup || '',
        bestWeight: record.weight,
        bestReps: record.reps,
        estimated1RM,
        achievedAt: record.createdAt,
      };

      if (!prMap.has(key)) {
        prMap.set(key, { best: entry, previous: null });
      } else {
        const existing = prMap.get(key);
        if (estimated1RM > existing.best.estimated1RM) {
          existing.previous = existing.best;
          existing.best = entry;
        } else if (!existing.previous || estimated1RM > existing.previous.estimated1RM) {
          existing.previous = entry;
        }
      }
    }

    return Array.from(prMap.values()).map(({ best, previous }) => ({
      ...best,
      deltaKg: previous ? +(best.bestWeight - previous.bestWeight).toFixed(1) : null,
    }));
  }

  /**
   * Calculer le volume total (tonnage) sur une période avec delta vs période précédente
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

    // Compute deltas vs previous period
    let deltaVolume = null;
    let deltaSets = null;
    let deltaReps = null;
    let deltaWorkouts = null;

    if (from && to) {
      const periodMs = new Date(to) - new Date(from);
      const prevFrom = new Date(new Date(from).getTime() - periodMs).toISOString().split('T')[0];
      const prevTo = new Date(new Date(from).getTime() - 1).toISOString().split('T')[0];
      const prevWorkouts = await this.workoutRepo.findCompletedByUser(userId, { from: prevFrom, to: prevTo });

      let prevVolume = 0, prevSets = 0, prevReps = 0;
      for (const w of prevWorkouts) {
        for (const s of w.exercises) {
          if (s.weight && s.reps) {
            prevVolume += s.weight * s.reps;
            prevSets += 1;
            prevReps += s.reps;
          }
        }
      }

      deltaVolume = prevVolume > 0 ? Math.round(((totalVolume - prevVolume) / prevVolume) * 100) : null;
      deltaSets = prevSets > 0 ? Math.round(((totalSets - prevSets) / prevSets) * 100) : null;
      deltaReps = prevReps > 0 ? Math.round(((totalReps - prevReps) / prevReps) * 100) : null;
      deltaWorkouts = prevWorkouts.length > 0 ? Math.round(((workouts.length - prevWorkouts.length) / prevWorkouts.length) * 100) : null;
    }

    return {
      totalVolume: Math.round(totalVolume * 10) / 10,
      totalVolumeKg: `${(totalVolume / 1000).toFixed(1)}T`,
      totalSets,
      totalReps,
      workoutCount: workouts.length,
      deltaVolume,
      deltaSets,
      deltaReps,
      deltaWorkouts,
      period: { from: from || 'all time', to: to || 'now' },
    };
  }

  /**
   * Historique du volume pour le graphique de progression (points par semaine)
   */
  async getVolumeHistory(userId, { months = 3 } = {}) {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - months);

    const workouts = await this.workoutRepo.findCompletedByUser(userId, {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    });

    // Group by ISO week
    const weekMap = new Map();
    for (const w of workouts) {
      const d = new Date(w.completedAt);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay() + 1);
      const key = weekStart.toISOString().split('T')[0];

      if (!weekMap.has(key)) weekMap.set(key, 0);
      for (const s of w.exercises) {
        if (s.weight && s.reps) weekMap.set(key, weekMap.get(key) + s.weight * s.reps);
      }
    }

    const points = Array.from(weekMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, volume]) => ({ date, volume: Math.round(volume) }));

    return { points };
  }

  /**
   * Volume quotidien ventilé par type (strength vs cardio) sur une période
   */
  async getVolumeDaily(userId, { from, to, period = 'week' } = {}) {
    if (!from) {
      const d = new Date();
      if (period === 'week') d.setDate(d.getDate() - 6);
      else if (period === 'month') d.setDate(d.getDate() - 29);
      else d.setDate(d.getDate() - 89);
      from = d.toISOString().split('T')[0];
    }
    if (!to) to = new Date().toISOString().split('T')[0];

    const workouts = await this.workoutRepo.findCompletedByUser(userId, { from, to });

    const dayMap = new Map();
    const start = new Date(from);
    const end = new Date(to);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dayMap.set(d.toISOString().split('T')[0], { strength: 0, cardio: 0 });
    }

    for (const workout of workouts) {
      const day = new Date(workout.completedAt).toISOString().split('T')[0];
      if (!dayMap.has(day)) continue;
      const bucket = dayMap.get(day);
      for (const set of workout.exercises) {
        if (set.weight && set.reps) {
          const vol = set.weight * set.reps;
          if (workout.type === 'cardio') bucket.cardio += vol;
          else bucket.strength += vol;
        }
      }
    }

    const days = [];
    let totalVolume = 0;
    for (const [date, volumes] of dayMap) {
      days.push({ date, ...volumes });
      totalVolume += volumes.strength + volumes.cardio;
    }

    // Previous period for comparison
    const periodDays = days.length;
    const prevFrom = new Date(start);
    prevFrom.setDate(prevFrom.getDate() - periodDays);
    const prevTo = new Date(start);
    prevTo.setDate(prevTo.getDate() - 1);
    const prevWorkouts = await this.workoutRepo.findCompletedByUser(userId, {
      from: prevFrom.toISOString().split('T')[0],
      to: prevTo.toISOString().split('T')[0],
    });
    let prevVolume = 0;
    for (const workout of prevWorkouts) {
      for (const set of workout.exercises) {
        if (set.weight && set.reps) prevVolume += set.weight * set.reps;
      }
    }

    const deltaPercent = prevVolume > 0 ? Math.round(((totalVolume - prevVolume) / prevVolume) * 100) : null;

    return { days, totalVolume: Math.round(totalVolume), deltaPercent };
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
    const yesterday = new Date(Date.now() - MS_PER_DAY).toISOString().split('T')[0];

    // Le streak doit commencer aujourd'hui ou hier
    if (dates[0] !== today && dates[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 0; i < dates.length - 1; i++) {
      const current = new Date(dates[i]);
      const previous = new Date(dates[i + 1]);
      const diffDays = (current - previous) / MS_PER_DAY;

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
