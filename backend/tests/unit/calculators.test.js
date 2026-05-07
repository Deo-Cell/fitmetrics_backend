const { 
  Epley1RMStrategy, 
  Brzycki1RMStrategy, 
  MifflinBMRStrategy, 
  HarrisBenedictBMRStrategy, 
  RMCalculator, 
  NutritionCalculator 
} = require('../../src/strategies/calculator/Calculators');

describe('Calculators Unit Tests', () => {
  
  describe('One Rep Max (1RM) Strategies', () => {
    const data = { weight: 100, reps: 10 };

    test('Epley formula should calculate correctly', () => {
      const strategy = new Epley1RMStrategy();
      const result = strategy.calculate(data);
      // 100 * (1 + 10/30) = 133.333...
      expect(result).toBeCloseTo(133.33, 1);
    });

    test('Brzycki formula should calculate correctly', () => {
      const strategy = new Brzycki1RMStrategy();
      const result = strategy.calculate(data);
      // 100 * (36 / (37 - 10)) = 100 * (36 / 27) = 133.333...
      expect(result).toBeCloseTo(133.33, 1);
    });

    test('RMCalculator should use provided strategy', () => {
      const calculator = new RMCalculator(new Epley1RMStrategy());
      expect(calculator.calculate1RM(100, 10)).toBe(133.3);
      
      calculator.setStrategy(new Brzycki1RMStrategy());
      expect(calculator.calculate1RM(100, 10)).toBe(133.3);
    });
  });

  describe('Basal Metabolic Rate (BMR) Strategies', () => {
    const profile = { weight: 80, heightCm: 180, age: 30, gender: 'male' };

    test('Mifflin-St Jeor formula should calculate correctly for male', () => {
      const strategy = new MifflinBMRStrategy();
      const result = strategy.calculate(profile);
      // (10 * 80) + (6.25 * 180) - (5 * 30) + 5 = 800 + 1125 - 150 + 5 = 1780
      expect(result).toBe(1780);
    });

    test('Mifflin-St Jeor formula should calculate correctly for female', () => {
      const strategy = new MifflinBMRStrategy();
      const result = strategy.calculate({ ...profile, gender: 'female' });
      // (10 * 80) + (6.25 * 180) - (5 * 30) - 161 = 800 + 1125 - 150 - 161 = 1614
      expect(result).toBe(1614);
    });

    test('Harris-Benedict formula should calculate correctly for male', () => {
      const strategy = new HarrisBenedictBMRStrategy();
      const result = strategy.calculate(profile);
      // 88.362 + (13.397 * 80) + (4.799 * 180) - (5.677 * 30)
      // 88.362 + 1071.76 + 863.82 - 170.31 = 1853.632
      expect(result).toBeCloseTo(1853.63, 1);
    });
  });

  describe('NutritionCalculator TDEE', () => {
    test('calculateTDEE should apply correct multipliers', () => {
      const calculator = new NutritionCalculator();
      const bmr = 2000;
      
      expect(calculator.calculateTDEE(bmr, 'sedentary')).toBe(2400); // 2000 * 1.2
      expect(calculator.calculateTDEE(bmr, 'moderate')).toBe(3100);  // 2000 * 1.55
      expect(calculator.calculateTDEE(bmr, 'very_active')).toBe(3800); // 2000 * 1.9
    });
  });
});
