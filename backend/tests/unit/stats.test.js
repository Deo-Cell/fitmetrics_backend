const StatsService = require('../../src/services/StatsService');

describe('StatsService Unit Tests', () => {
  let statsService;
  
  // Mock repositories
  const mockWorkoutRepo = {
    findCompletedByUser: jest.fn()
  };
  const mockWorkoutExerciseRepo = {
    findPersonalRecords: jest.fn()
  };

  beforeEach(() => {
    statsService = new StatsService(mockWorkoutRepo, mockWorkoutExerciseRepo);
    jest.clearAllMocks();
  });

  describe('calculateStreak', () => {
    test('should return 0 when there are no workouts', () => {
      expect(statsService.calculateStreak([])).toBe(0);
    });

    test('should return correct streak when workouts are on consecutive days', () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const dayBefore = new Date(Date.now() - 172800000).toISOString().split('T')[0];

      const workouts = [
        { completedAt: today },
        { completedAt: yesterday },
        { completedAt: dayBefore }
      ];

      expect(statsService.calculateStreak(workouts)).toBe(3);
    });

    test('should return 0 when last workout was too long ago', () => {
      const threeDaysAgo = new Date(Date.now() - 259200000).toISOString().split('T')[0];
      const workouts = [{ completedAt: threeDaysAgo }];
      expect(statsService.calculateStreak(workouts)).toBe(0);
    });
  });

  describe('getVolume', () => {
    test('should calculate correct total tonnage when given workout data', async () => {
      const workouts = [
        {
          exercises: [
            { weight: 100, reps: 10 }, // 1000
            { weight: 100, reps: 10 }  // 1000
          ]
        },
        {
          exercises: [
            { weight: 50, reps: 20 }   // 1000
          ]
        }
      ];
      mockWorkoutRepo.findCompletedByUser.mockResolvedValue(workouts);

      const result = await statsService.getVolume(1);
      expect(result.totalVolume).toBe(3000);
      expect(result.totalVolumeKg).toBe('3.0T');
      expect(result.workoutCount).toBe(2);
    });
  });
});
