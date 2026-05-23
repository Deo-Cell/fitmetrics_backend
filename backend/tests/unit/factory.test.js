const WorkoutSetFactory = require('../../src/factories/WorkoutSetFactory');

describe('WorkoutSetFactory Unit Tests', () => {
  describe('createStrengthSet', () => {
    test('should throw error when missing weight or reps', () => {
      expect(() => WorkoutSetFactory.create('strength', { weight: 50 })).toThrow('Strength set requires weight and reps');
      expect(() => WorkoutSetFactory.create('strength', { reps: 10 })).toThrow('Strength set requires weight and reps');
    });

    test('should throw error when weight or reps are negative or zero', () => {
      expect(() => WorkoutSetFactory.create('strength', { weight: -5, reps: 10 })).toThrow('Weight and reps must be positive');
      expect(() => WorkoutSetFactory.create('strength', { weight: 50, reps: -5 })).toThrow('Weight and reps must be positive');
    });

    test('should return formatted strength set when given valid data', () => {
      const data = {
        workoutId: 1,
        exerciseId: 2,
        setNumber: 1,
        weight: 100,
        reps: 5,
        completed: false
      };
      const result = WorkoutSetFactory.create('strength', data);
      expect(result.duration).toBeNull();
      expect(result.distance).toBeNull();
      expect(result.completed).toBe(false);
      expect(result.weight).toBe(100);
      expect(result.reps).toBe(5);
    });

    test('should use default completed true when not provided', () => {
      const result = WorkoutSetFactory.create('strength', { weight: 100, reps: 5 });
      expect(result.completed).toBe(true);
    });
  });

  describe('createCardioSet', () => {
    test('should throw error when missing duration', () => {
      expect(() => WorkoutSetFactory.create('cardio', {})).toThrow('Cardio set requires duration');
    });

    test('should throw error when duration is negative or zero', () => {
      expect(() => WorkoutSetFactory.create('cardio', { duration: -5 })).toThrow('Duration must be positive');
    });

    test('should return formatted cardio set when given valid data', () => {
      const data = {
        workoutId: 1,
        exerciseId: 2,
        setNumber: 1,
        duration: 30,
        distance: 5,
        completed: false
      };
      const result = WorkoutSetFactory.create('cardio', data);
      expect(result.weight).toBeNull();
      expect(result.reps).toBeNull();
      expect(result.duration).toBe(30);
      expect(result.distance).toBe(5);
      expect(result.completed).toBe(false);
    });

    test('should return default strength set when type is unknown', () => {
      const result = WorkoutSetFactory.create('unknown', { weight: 100, reps: 5 });
      expect(result.weight).toBe(100);
    });
  });
});
