const { DataTypes } = require('sequelize');
const dbConnection = require('../config/db');
const sequelize = dbConnection.getSequelize();

const Workout = sequelize.define('Workout', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Ex: "Push Day", "Leg Day", "Cardio matin"',
  },
  type: {
    type: DataTypes.ENUM('strength', 'cardio', 'mixed'),
    allowNull: false,
    defaultValue: 'strength',
  },
  status: {
    type: DataTypes.ENUM('in_progress', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'in_progress',
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Durée en minutes',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'workouts',
  timestamps: true,
});

module.exports = Workout;
