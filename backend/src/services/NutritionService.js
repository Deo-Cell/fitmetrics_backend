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
   * Calcul du TDEE à partir du profil utilisateur
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

    const tdee = this.nutritionCalculator.calculateTDEE(
      bmr,
      user.activityLevel || 'moderate'
    );

    return {
      bmr,
      tdee,
      activityLevel: user.activityLevel || 'moderate',
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
