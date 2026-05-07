const BaseRepository = require('./BaseRepository');
const { Exercise } = require('../models');


class ExerciseRepository extends BaseRepository {
  constructor() {
    super(Exercise);
  }

  async findWithFilters({ muscle, equipment, difficulty, category }) {
    const where = {};

    if (muscle) where.muscleGroup = muscle;
    if (equipment) where.equipment = equipment;
    if (difficulty) where.difficulty = difficulty;
    if (category) where.category = category;

    return this.findAll({ where });
  }
}

module.exports = ExerciseRepository;
