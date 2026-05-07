const AuthService = require('../services/AuthService');
const logger = require('../config/logger');

const authService = new AuthService();

/**
 * Middleware d'authentification JWT
 * Vérifie le token dans le header Authorization: Bearer <token>
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = authService.verifyToken(token);
    req.user = decoded; // { id, email }
    next();
  } catch (error) {
    logger.warn('Invalid token attempt', { error: error.message });
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
