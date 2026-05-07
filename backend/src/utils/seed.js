const { Exercise } = require('../models');
const logger = require('../config/logger');

const initialExercises = [
  // --- Chest ---
  {
    name: 'Bench Press',
    category: 'strength',
    muscleGroup: 'chest',
    equipment: 'barbell',
    difficulty: 'intermediate',
    description: 'Le grand classique pour les pectoraux.',
    metValue: 6.0
  },
  {
    name: 'Dumbbell Flyes',
    category: 'strength',
    muscleGroup: 'chest',
    equipment: 'dumbbell',
    difficulty: 'beginner',
    description: 'Isolation des pectoraux avec haltères.',
    metValue: 5.0
  },
  // --- Back ---
  {
    name: 'Pull Ups',
    category: 'strength',
    muscleGroup: 'back',
    equipment: 'bodyweight',
    difficulty: 'advanced',
    description: 'Tractions à la barre fixe.',
    metValue: 8.0
  },
  {
    name: 'Bent Over Row',
    category: 'strength',
    muscleGroup: 'back',
    equipment: 'barbell',
    difficulty: 'intermediate',
    description: 'Tirage buste penché pour l\'épaisseur du dos.',
    metValue: 6.0
  },
  // --- Legs ---
  {
    name: 'Squat',
    category: 'strength',
    muscleGroup: 'legs',
    equipment: 'barbell',
    difficulty: 'intermediate',
    description: 'L\'exercice roi pour les jambes.',
    metValue: 8.0
  },
  {
    name: 'Leg Extension',
    category: 'strength',
    muscleGroup: 'legs',
    equipment: 'machine',
    difficulty: 'beginner',
    description: 'Isolation des quadriceps.',
    metValue: 4.0
  },
  // --- Cardio ---
  {
    name: 'Running',
    category: 'cardio',
    muscleGroup: 'full_body',
    equipment: 'none',
    difficulty: 'beginner',
    description: 'Course à pied classique.',
    metValue: 9.8
  },
  {
    name: 'Cycling',
    category: 'cardio',
    muscleGroup: 'legs',
    equipment: 'none',
    difficulty: 'beginner',
    description: 'Vélo ou vélo d\'appartement.',
    metValue: 7.5
  },
  {
    name: 'Burpees',
    category: 'hiit',
    muscleGroup: 'full_body',
    equipment: 'bodyweight',
    difficulty: 'advanced',
    description: 'Exercice de haute intensité.',
    metValue: 10.0
  }
];

async function seedExercises() {
  try {
    const count = await Exercise.count();
    if (count === 0) {
      logger.info('Seeding exercises...');
      await Exercise.bulkCreate(initialExercises);
      logger.info(`${initialExercises.length} exercises seeded successfully.`);
    } else {
      logger.debug('Exercises table already has data, skipping seed.');
    }
  } catch (error) {
    logger.error('Error seeding exercises:', error);
  }
}

module.exports = { seedExercises };
