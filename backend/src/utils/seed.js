const { Exercise } = require('../models');
const logger = require('../config/logger');

const initialExercises = [
  // ══════════════════════════════════════
  // PECTORAUX (chest)
  // ══════════════════════════════════════
  { name: 'Développé couché barre', category: 'strength', muscleGroup: 'chest', equipment: 'barbell', difficulty: 'intermediate', description: 'Le grand classique pour les pectoraux.', metValue: 6.0 },
  { name: 'Développé incliné haltères', category: 'strength', muscleGroup: 'chest', equipment: 'dumbbell', difficulty: 'intermediate', description: 'Cible le haut des pectoraux.', metValue: 5.5 },
  { name: 'Développé décliné barre', category: 'strength', muscleGroup: 'chest', equipment: 'barbell', difficulty: 'intermediate', description: 'Cible le bas des pectoraux.', metValue: 5.5 },
  { name: 'Écarté haltères', category: 'strength', muscleGroup: 'chest', equipment: 'dumbbell', difficulty: 'beginner', description: 'Isolation des pectoraux en ouverture.', metValue: 5.0 },
  { name: 'Écarté poulie vis-à-vis', category: 'strength', muscleGroup: 'chest', equipment: 'cable', difficulty: 'beginner', description: 'Isolation à la poulie, tension constante.', metValue: 4.5 },
  { name: 'Pompes', category: 'bodyweight', muscleGroup: 'chest', equipment: 'bodyweight', difficulty: 'beginner', description: 'Exercice de base au poids du corps.', metValue: 5.0 },
  { name: 'Chest press machine', category: 'strength', muscleGroup: 'chest', equipment: 'machine', difficulty: 'beginner', description: 'Développé couché guidé à la machine.', metValue: 5.0 },
  { name: 'Dips (pectoraux)', category: 'bodyweight', muscleGroup: 'chest', equipment: 'bodyweight', difficulty: 'advanced', description: 'Dips buste penché pour cibler les pecs.', metValue: 7.0 },

  // ══════════════════════════════════════
  // DOS (back)
  // ══════════════════════════════════════
  { name: 'Tractions pronation', category: 'strength', muscleGroup: 'back', equipment: 'bodyweight', difficulty: 'advanced', description: 'Tractions prise large pour la largeur du dos.', metValue: 8.0 },
  { name: 'Tractions supination', category: 'strength', muscleGroup: 'back', equipment: 'bodyweight', difficulty: 'intermediate', description: 'Tractions prise serrée, biceps impliqués.', metValue: 7.5 },
  { name: 'Rowing barre', category: 'strength', muscleGroup: 'back', equipment: 'barbell', difficulty: 'intermediate', description: 'Tirage buste penché pour l\'épaisseur du dos.', metValue: 6.0 },
  { name: 'Rowing haltère unilatéral', category: 'strength', muscleGroup: 'back', equipment: 'dumbbell', difficulty: 'beginner', description: 'Tirage un bras, excellent pour l\'équilibre.', metValue: 5.5 },
  { name: 'Tirage vertical poulie haute', category: 'strength', muscleGroup: 'back', equipment: 'cable', difficulty: 'beginner', description: 'Alternative aux tractions pour la largeur.', metValue: 5.0 },
  { name: 'Tirage horizontal poulie basse', category: 'strength', muscleGroup: 'back', equipment: 'cable', difficulty: 'beginner', description: 'Pour l\'épaisseur du dos, mouvement guidé.', metValue: 5.0 },
  { name: 'Soulevé de terre', category: 'strength', muscleGroup: 'back', equipment: 'barbell', difficulty: 'advanced', description: 'Mouvement complet, dos + jambes + gainage.', metValue: 8.5 },
  { name: 'Tractions lestées', category: 'strength', muscleGroup: 'back', equipment: 'bodyweight', difficulty: 'advanced', description: 'Tractions avec charge additionnelle.', metValue: 9.0 },

  // ══════════════════════════════════════
  // ÉPAULES (shoulders)
  // ══════════════════════════════════════
  { name: 'Développé militaire barre', category: 'strength', muscleGroup: 'shoulders', equipment: 'barbell', difficulty: 'intermediate', description: 'Développé debout pour les épaules.', metValue: 6.0 },
  { name: 'Développé haltères assis', category: 'strength', muscleGroup: 'shoulders', equipment: 'dumbbell', difficulty: 'intermediate', description: 'Développé épaules stabilisé.', metValue: 5.5 },
  { name: 'Élévations latérales', category: 'strength', muscleGroup: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner', description: 'Isolation du deltoïde moyen.', metValue: 4.0 },
  { name: 'Élévations frontales', category: 'strength', muscleGroup: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner', description: 'Isolation du deltoïde antérieur.', metValue: 4.0 },
  { name: 'Oiseau (rear delt fly)', category: 'strength', muscleGroup: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner', description: 'Isolation du deltoïde postérieur.', metValue: 4.0 },
  { name: 'Face pull', category: 'strength', muscleGroup: 'shoulders', equipment: 'cable', difficulty: 'beginner', description: 'Santé des épaules et deltoïde postérieur.', metValue: 4.0 },
  { name: 'Shrugs haltères', category: 'strength', muscleGroup: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner', description: 'Isolation des trapèzes supérieurs.', metValue: 4.5 },

  // ══════════════════════════════════════
  // BRAS (arms)
  // ══════════════════════════════════════
  { name: 'Curl barre EZ', category: 'strength', muscleGroup: 'arms', equipment: 'barbell', difficulty: 'beginner', description: 'Flexion biceps classique.', metValue: 4.5 },
  { name: 'Curl haltères alternés', category: 'strength', muscleGroup: 'arms', equipment: 'dumbbell', difficulty: 'beginner', description: 'Curl un bras après l\'autre.', metValue: 4.0 },
  { name: 'Curl marteau', category: 'strength', muscleGroup: 'arms', equipment: 'dumbbell', difficulty: 'beginner', description: 'Cible le brachial et le brachio-radial.', metValue: 4.0 },
  { name: 'Extensions triceps poulie haute', category: 'strength', muscleGroup: 'arms', equipment: 'cable', difficulty: 'beginner', description: 'Isolation triceps à la poulie.', metValue: 4.0 },
  { name: 'Dips triceps (banc)', category: 'bodyweight', muscleGroup: 'arms', equipment: 'bodyweight', difficulty: 'beginner', description: 'Dips entre deux bancs.', metValue: 5.0 },
  { name: 'Barre au front (skull crusher)', category: 'strength', muscleGroup: 'arms', equipment: 'barbell', difficulty: 'intermediate', description: 'Extension triceps allongé.', metValue: 5.0 },
  { name: 'Curl concentré', category: 'strength', muscleGroup: 'arms', equipment: 'dumbbell', difficulty: 'beginner', description: 'Isolation stricte du biceps.', metValue: 3.5 },
  { name: 'Extension triceps haltère au-dessus', category: 'strength', muscleGroup: 'arms', equipment: 'dumbbell', difficulty: 'beginner', description: 'Extension au-dessus de la tête.', metValue: 4.0 },

  // ══════════════════════════════════════
  // JAMBES (legs)
  // ══════════════════════════════════════
  { name: 'Squat barre', category: 'strength', muscleGroup: 'legs', equipment: 'barbell', difficulty: 'intermediate', description: 'L\'exercice roi pour les jambes.', metValue: 8.0 },
  { name: 'Squat bulgare', category: 'strength', muscleGroup: 'legs', equipment: 'dumbbell', difficulty: 'intermediate', description: 'Fente pied arrière surélevé.', metValue: 7.0 },
  { name: 'Presse à cuisses', category: 'strength', muscleGroup: 'legs', equipment: 'machine', difficulty: 'beginner', description: 'Mouvement guidé pour les quadriceps.', metValue: 6.5 },
  { name: 'Leg extension', category: 'strength', muscleGroup: 'legs', equipment: 'machine', difficulty: 'beginner', description: 'Isolation des quadriceps.', metValue: 4.0 },
  { name: 'Leg curl', category: 'strength', muscleGroup: 'legs', equipment: 'machine', difficulty: 'beginner', description: 'Isolation des ischio-jambiers.', metValue: 4.0 },
  { name: 'Soulevé de terre roumain', category: 'strength', muscleGroup: 'legs', equipment: 'barbell', difficulty: 'intermediate', description: 'Cible les ischio-jambiers et fessiers.', metValue: 7.0 },
  { name: 'Hip thrust', category: 'strength', muscleGroup: 'legs', equipment: 'barbell', difficulty: 'intermediate', description: 'Le meilleur exercice pour les fessiers.', metValue: 6.0 },
  { name: 'Mollets debout (machine)', category: 'strength', muscleGroup: 'legs', equipment: 'machine', difficulty: 'beginner', description: 'Isolation des mollets.', metValue: 4.0 },
  { name: 'Fentes marchées', category: 'strength', muscleGroup: 'legs', equipment: 'dumbbell', difficulty: 'beginner', description: 'Fentes en avançant, jambes + équilibre.', metValue: 6.5 },

  // ══════════════════════════════════════
  // ABDOS (abs)
  // ══════════════════════════════════════
  { name: 'Crunch', category: 'bodyweight', muscleGroup: 'abs', equipment: 'bodyweight', difficulty: 'beginner', description: 'Flexion abdominale de base.', metValue: 4.0 },
  { name: 'Planche (gainage)', category: 'bodyweight', muscleGroup: 'abs', equipment: 'bodyweight', difficulty: 'beginner', description: 'Gainage isométrique du core.', metValue: 4.0 },
  { name: 'Relevé de jambes suspendu', category: 'bodyweight', muscleGroup: 'abs', equipment: 'bodyweight', difficulty: 'advanced', description: 'Suspension et remontée des jambes.', metValue: 6.0 },
  { name: 'Russian twist', category: 'bodyweight', muscleGroup: 'abs', equipment: 'bodyweight', difficulty: 'beginner', description: 'Rotation du buste pour les obliques.', metValue: 4.5 },
  { name: 'Ab wheel (roue abdominale)', category: 'bodyweight', muscleGroup: 'abs', equipment: 'none', difficulty: 'intermediate', description: 'Roulement complet, core intense.', metValue: 5.5 },
  { name: 'Crunch poulie haute', category: 'strength', muscleGroup: 'abs', equipment: 'cable', difficulty: 'intermediate', description: 'Crunch avec charge à la poulie.', metValue: 5.0 },

  // ══════════════════════════════════════
  // FULL BODY / CARDIO / HIIT
  // ══════════════════════════════════════
  { name: 'Course à pied', category: 'cardio', muscleGroup: 'full_body', equipment: 'none', difficulty: 'beginner', description: 'Course à pied classique.', metValue: 9.8 },
  { name: 'Vélo (cyclisme)', category: 'cardio', muscleGroup: 'legs', equipment: 'none', difficulty: 'beginner', description: 'Vélo ou vélo d\'appartement.', metValue: 7.5 },
  { name: 'Rameur', category: 'cardio', muscleGroup: 'full_body', equipment: 'machine', difficulty: 'beginner', description: 'Cardio full-body à faible impact.', metValue: 8.5 },
  { name: 'Corde à sauter', category: 'cardio', muscleGroup: 'full_body', equipment: 'none', difficulty: 'beginner', description: 'Cardio intense et coordination.', metValue: 11.0 },
  { name: 'Natation', category: 'cardio', muscleGroup: 'full_body', equipment: 'none', difficulty: 'intermediate', description: 'Cardio sans impact, full body.', metValue: 8.0 },
  { name: 'Burpees', category: 'hiit', muscleGroup: 'full_body', equipment: 'bodyweight', difficulty: 'advanced', description: 'Exercice complet haute intensité.', metValue: 10.0 },
  { name: 'Mountain climbers', category: 'hiit', muscleGroup: 'full_body', equipment: 'bodyweight', difficulty: 'intermediate', description: 'Gainage dynamique + cardio.', metValue: 8.0 },
  { name: 'Box jumps', category: 'hiit', muscleGroup: 'legs', equipment: 'none', difficulty: 'intermediate', description: 'Sauts sur caisse, explosivité.', metValue: 9.0 },
  { name: 'Kettlebell swing', category: 'hiit', muscleGroup: 'full_body', equipment: 'kettlebell', difficulty: 'intermediate', description: 'Mouvement balistique, cardio + force.', metValue: 9.0 },
  { name: 'Thrusters', category: 'hiit', muscleGroup: 'full_body', equipment: 'barbell', difficulty: 'advanced', description: 'Squat + développé enchaîné.', metValue: 9.5 },
];

async function seedExercises() {
  try {
    const existing = await Exercise.findAll({ attributes: ['name'] });
    const existingNames = new Set(existing.map(e => e.name));
    const toInsert = initialExercises.filter(ex => !existingNames.has(ex.name));

    if (toInsert.length > 0) {
      logger.info(`Seeding ${toInsert.length} new exercises...`);
      await Exercise.bulkCreate(toInsert);
      logger.info(`${toInsert.length} exercises seeded successfully.`);
    } else {
      logger.debug('All exercises already present, skipping seed.');
    }
  } catch (error) {
    logger.error('Error seeding exercises:', error);
  }
}

module.exports = { seedExercises };
