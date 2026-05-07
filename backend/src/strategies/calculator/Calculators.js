/**
 * Strategy Pattern for Fitness Calculations
 * Justification: Il existe plusieurs formules pour calculer le métabolisme de base (BMR) 
 * ou le One Rep Max (1RM). Le pattern Strategy permet de permuter ces algorithmes 
 * dynamiquement sans modifier le code qui les utilise, facilitant les tests et l'ajout
 * d'autres algorithmes futurs.
 */

// --- Base Strategy Interfaces ---
class CalculatorStrategy {
  calculate(data) {
    throw new Error('calculate method must be implemented');
  }
}

// --- Specific Strategies for 1RM (One Rep Max) ---

// Epley Formula: 1RM = weight * (1 + reps / 30)
class Epley1RMStrategy extends CalculatorStrategy {
  calculate({ weight, reps }) {
    if (reps === 1) return weight;
    return weight * (1 + reps / 30);
  }
}

// Brzycki Formula: 1RM = weight * (36 / (37 - reps))
class Brzycki1RMStrategy extends CalculatorStrategy {
  calculate({ weight, reps }) {
    if (reps === 1) return weight;
    if (reps >= 37) return weight; // Formula breaks down at high reps
    return weight * (36 / (37 - reps));
  }
}

// --- Specific Strategies for BMR (Basal Metabolic Rate) ---

// Mifflin-St Jeor Formula
class MifflinBMRStrategy extends CalculatorStrategy {
  calculate({ weight, heightCm, age, gender }) {
    let bmr = (10 * weight) + (6.25 * heightCm) - (5 * age);
    return gender === 'male' ? bmr + 5 : bmr - 161;
  }
}

// Harris-Benedict Formula (Revised by Roza and Shizgal)
class HarrisBenedictBMRStrategy extends CalculatorStrategy {
  calculate({ weight, heightCm, age, gender }) {
    if (gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * heightCm) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * heightCm) - (4.330 * age);
    }
  }
}

// --- Context classes ---

class RMCalculator {
  constructor(strategy) {
    this.strategy = strategy || new Epley1RMStrategy();
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  calculate1RM(weight, reps) {
    return Math.round(this.strategy.calculate({ weight, reps }) * 10) / 10; // Round to 1 decimal
  }
}

class NutritionCalculator {
  constructor(strategy) {
    this.strategy = strategy || new MifflinBMRStrategy();
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  calculateBMR(weight, heightCm, age, gender) {
    return Math.round(this.strategy.calculate({ weight, heightCm, age, gender }));
  }

  // TDEE (Total Daily Energy Expenditure) calculation
  calculateTDEE(bmr, activityLevel) {
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    return Math.round(bmr * (multipliers[activityLevel] || 1.2));
  }
}

module.exports = {
  Epley1RMStrategy,
  Brzycki1RMStrategy,
  MifflinBMRStrategy,
  HarrisBenedictBMRStrategy,
  RMCalculator,
  NutritionCalculator
};
