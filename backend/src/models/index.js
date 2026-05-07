const User = require('./User');
const Exercise = require('./Exercise');
const Workout = require('./Workout');
const WorkoutExercise = require('./WorkoutExercise');

// =============================================
// Définition des relations entre les modèles
// =============================================

// Un User possède plusieurs Workouts
User.hasMany(Workout, { foreignKey: 'userId', as: 'workouts' });
Workout.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Un Workout contient plusieurs WorkoutExercises
Workout.hasMany(WorkoutExercise, { foreignKey: 'workoutId', as: 'exercises' });
WorkoutExercise.belongsTo(Workout, { foreignKey: 'workoutId', as: 'workout' });

// Un Exercise peut apparaître dans plusieurs WorkoutExercises
Exercise.hasMany(WorkoutExercise, { foreignKey: 'exerciseId', as: 'workoutExercises' });
WorkoutExercise.belongsTo(Exercise, { foreignKey: 'exerciseId', as: 'exercise' });

module.exports = {
  User,
  Exercise,
  Workout,
  WorkoutExercise,
};
