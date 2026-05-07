const NutritionService = require('../../src/services/NutritionService');

describe('NutritionService Unit Tests', () => {
  let nutritionService;

  beforeEach(() => {
    nutritionService = new NutritionService();
  });

  test('calculateBMI should return correct value and category', () => {
    const result = nutritionService.calculateBMI(80, 180);
    expect(result.bmi).toBe(24.7);
    expect(result.category).toBe('normal');
  });

  test('calculateBMI should throw error for invalid inputs', () => {
    expect(() => nutritionService.calculateBMI(-80, 180)).toThrow();
    expect(() => nutritionService.calculateBMI(80, 0)).toThrow();
  });

  test('calculateCaloriesBurned should return correct estimation', () => {
    // MET for strength is 6.0
    // calories = 6.0 * 80kg * (60min / 60) = 480
    const result = nutritionService.calculateCaloriesBurned(80, 60, 'strength');
    expect(result.caloriesBurned).toBe(480);
    expect(result.met).toBe(6.0);
  });
});
