const { DataTypes } = require('sequelize');
const dbConnection = require('../config/db');
const sequelize = dbConnection.getSequelize();

const Exercise = sequelize.define('Exercise', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('strength', 'cardio', 'stretching', 'hiit', 'bodyweight'),
    allowNull: false,
  },
  muscleGroup: {
    type: DataTypes.ENUM('chest', 'back', 'shoulders', 'arms', 'legs', 'abs', 'full_body'),
    allowNull: false,
  },
  equipment: {
    type: DataTypes.ENUM('barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell', 'none'),
    allowNull: false,
    defaultValue: 'none',
  },
  difficulty: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: false,
    defaultValue: 'beginner',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // MET value for calorie calculation (Metabolic Equivalent of Task)
  metValue: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 6.0,
    comment: 'Valeur MET pour le calcul des calories brûlées',
  },
}, {
  tableName: 'exercises',
  timestamps: true,
});

module.exports = Exercise;
