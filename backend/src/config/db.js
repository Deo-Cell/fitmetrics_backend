const { Sequelize } = require('sequelize');
const logger = require('./logger');

/**
 * Singleton Pattern — Database Connection
 * Justification : Garantit une instance unique de connexion à la base de données
 * dans toute l'application. Évite les connexions multiples et facilite le basculement
 * entre SQLite (tests) et PostgreSQL (production/dev).
 */
class DatabaseConnection {
  constructor() {
    if (DatabaseConnection.instance) {
      return DatabaseConnection.instance;
    }

    const mode = process.env.NODE_ENV || 'development';

    if (mode === 'test') {
      this.sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
      });
    } else {
      const dbUrl =
        process.env.DATABASE_URL ||
        'postgres://postgres:postgres@localhost:5432/fitmetrics';
      this.sequelize = new Sequelize(dbUrl, {
        dialect: 'postgres',
        logging: (msg) => logger.debug(msg),
      });
    }

    DatabaseConnection.instance = this;
  }

  async connect() {
    try {
      await this.sequelize.authenticate();
      logger.info('Database connection established successfully.');
    } catch (error) {
      logger.error('Unable to connect to the database:', error);
      throw error;
    }
  }

  getSequelize() {
    return this.sequelize;
  }
}

const dbConnection = new DatabaseConnection();
module.exports = dbConnection;
