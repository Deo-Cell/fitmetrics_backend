const UserRepository = require('../repositories/UserRepository');
const {
  NutritionCalculator,
  MifflinBMRStrategy,
} = require('../strategies/calculator/Calculators');


// Valeurs MET (Metabolic Equivalent of Task) pour estimer les calories brûlées
const MET_VALUES = {
  strength: 6.0,
  cardio: 9.8,
  hiit: 8.0,
  stretching: 2.5,
  bodyweight: 5.0,
  mixed: 6.0,
};

class NutritionService {
  constructor(userRepository, nutritionCalculator) {
    this.userRepository = userRepository || new UserRepository();
    this.nutritionCalculator =
      nutritionCalculator || new NutritionCalculator(new MifflinBMRStrategy());
  }

  /**
   * Calcul du BMI (Body Mass Index / IMC)
   * Formule : poids(kg) / (taille(m))²
   */
  calculateBMI(weight, heightCm) {
    if (!weight || !heightCm || weight <= 0 || heightCm <= 0) {
      throw new Error('Weight and height must be positive numbers');
    }

    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);
    const rounded = Math.round(bmi * 10) / 10;

    let category;
    if (rounded < 18.5) category = 'underweight';
    else if (rounded < 25) category = 'normal';
    else if (rounded < 30) category = 'overweight';
    else category = 'obese';

    return { bmi: rounded, category };
  }

  /**
   * Calcul du TDEE à partir du profil utilisateur avec ventilation détaillée
   */
  async calculateTDEE(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    if (!user.weight || !user.heightCm || !user.age || !user.gender) {
      throw new Error(
        'Complete profile required (weight, height, age, gender)'
      );
    }

    const bmr = this.nutritionCalculator.calculateBMR(
      user.weight,
      user.heightCm,
      user.age,
      user.gender
    );

    const activityLevel = user.activityLevel || 'moderate';
    const tdee = this.nutritionCalculator.calculateTDEE(bmr, activityLevel);

    // Ventilation détaillée
    const neat = Math.round(tdee * 0.25);
    const exerciseCalories = Math.round(tdee * 0.10);
    const tef = Math.round(tdee * 0.05);
    const bmrPct = Math.round((bmr / tdee) * 100);
    const neatPct = Math.round((neat / tdee) * 100);
    const exercisePct = Math.round((exerciseCalories / tdee) * 100);
    const tefPct = Math.round((tef / tdee) * 100);

    // Objectif calorique basé sur le goal de l'utilisateur
    const goal = user.goal || 'maintenance';
    let targetMin, targetMax, goalLabel;
    if (goal === 'weight_loss') {
      targetMin = Math.round(tdee - 500);
      targetMax = Math.round(tdee - 300);
      goalLabel = 'perdre du poids';
    } else if (goal === 'muscle_gain') {
      targetMin = Math.round(tdee + 100);
      targetMax = Math.round(tdee + 300);
      goalLabel = 'prendre du muscle';
    } else {
      targetMin = Math.round(tdee - 100);
      targetMax = Math.round(tdee + 100);
      goalLabel = 'maintenir ton poids';
    }

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      activityLevel,
      breakdown: [
        { label: 'Métabolisme de base (BMR)', sublabel: 'Ce que ton corps brûle juste pour vivre.', value: Math.round(bmr), pct: bmrPct, color: '#3B82F6' },
        { label: 'Activité non sportive', sublabel: 'Tes déplacements, ta posture, ta journée.', value: neat, pct: neatPct, color: '#22C55E' },
        { label: 'Entraînement', sublabel: 'Tes séances en moyenne.', value: exerciseCalories, pct: exercisePct, color: '#F97316' },
        { label: 'Effet thermique des aliments', sublabel: 'Énergie que ton corps dépense pour digérer.', value: tef, pct: tefPct, color: '#A78BFA' },
      ],
      target: { min: targetMin, max: targetMax, goalLabel },
      profile: {
        weight: user.weight,
        heightCm: user.heightCm,
        age: user.age,
        gender: user.gender,
      },
    };
  }

  /**
   * Estimation des calories brûlées pour un workout
   * Formule : MET × poids(kg) × durée(heures)
   */
  calculateCaloriesBurned(weight, durationMinutes, workoutType) {
    if (!weight || !durationMinutes || weight <= 0 || durationMinutes <= 0) {
      throw new Error('Weight and duration must be positive');
    }

    const met = MET_VALUES[workoutType] || MET_VALUES.mixed;
    const durationHours = durationMinutes / 60;
    const calories = met * weight * durationHours;

    return {
      caloriesBurned: Math.round(calories),
      met,
      durationMinutes,
      workoutType: workoutType || 'mixed',
    };
  }
}

module.exports = NutritionService;
