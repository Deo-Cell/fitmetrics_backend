const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/UserRepository');
const logger = require('../config/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'fitmetrics-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository || new UserRepository();
  }

  async register(email, password, { firstName, lastName } = {}) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    logger.info('User registered', { userId: user.id, email });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      token: this.generateToken(user),
    };
  }

  async login(email, password) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    logger.info('User logged in', { userId: user.id, email });

    return {
      id: user.id,
      email: user.email,
      token: this.generateToken(user),
    };
  }

  generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
  }
}

module.exports = AuthService;
