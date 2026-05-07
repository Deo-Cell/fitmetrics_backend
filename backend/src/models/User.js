const { DataTypes } = require('sequelize');
const dbConnection = require('../config/db');
const sequelize = dbConnection.getSequelize();

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // --- Profil physique ---
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Poids en kg',
  },
  heightCm: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Taille en cm',
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female'),
    allowNull: true,
  },
  level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: true,
    defaultValue: 'beginner',
  },
  goal: {
    type: DataTypes.ENUM('weight_loss', 'muscle_gain', 'endurance', 'strength', 'maintenance'),
    allowNull: true,
  },
  activityLevel: {
    type: DataTypes.ENUM('sedentary', 'light', 'moderate', 'active', 'very_active'),
    allowNull: true,
    defaultValue: 'moderate',
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
