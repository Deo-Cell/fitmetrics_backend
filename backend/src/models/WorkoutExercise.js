const { DataTypes } = require('sequelize');
const dbConnection = require('../config/db');
const sequelize = dbConnection.getSequelize();

/**
 * WorkoutExercise — Table de liaison entre un Workout et un Exercise.
 * Contient les séries (sets) effectuées pour chaque exercice dans une séance.
 * 
 * Pour la musculation : on utilise weight + reps
 * Pour le cardio : on utilise duration + distance
 * 
 * C'est ici que le pattern Factory intervient pour créer le bon type de set.
 */
const WorkoutExercise = sequelize.define('WorkoutExercise', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  workoutId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'workouts', key: 'id' },
  },
  exerciseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'exercises', key: 'id' },
  },
  setNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Numéro de la série (1, 2, 3...)',
  },
  // --- Champs Musculation ---
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Poids en kg (musculation)',
  },
  reps: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Nombre de répétitions (musculation)',
  },
  // --- Champs Cardio ---
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Durée en secondes (cardio)',
  },
  distance: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Distance en km (cardio)',
  },
  completed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'workout_exercises',
  timestamps: true,
});

module.exports = WorkoutExercise;
