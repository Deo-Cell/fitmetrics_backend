const app = require('./app');
const dbConnection = require('./config/db');
const logger = require('./config/logger');
const { seedExercises } = require('./utils/seed');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Connexion à la BDD
    await dbConnection.connect();

    // Synchroniser les modèles (crée les tables si elles n'existent pas)
    // En production, on utiliserait des migrations
    require('./models'); // Charge les relations
    const isDev = process.env.NODE_ENV !== 'production';
    await dbConnection.getSequelize().sync({ alter: isDev });

    // Seed les exercices si la table est vide
    await seedExercises();

    app.listen(PORT, () => {
      logger.info(`FitMetrics API running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

start();
