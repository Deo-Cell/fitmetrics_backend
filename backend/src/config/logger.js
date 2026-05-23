const winston = require('winston');

// Singleton pattern for Logger
class Logger {
  constructor() {
    if (!Logger.instance) {
      const mode = process.env.NODE_ENV || 'development';
      
      this.logger = winston.createLogger({
        level: mode === 'production' ? 'info' : 'debug',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
        defaultMeta: { service: 'fitmetrics-api' },
        transports: [
          new winston.transports.Console({
            format: mode === 'development' ? 
              winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
              ) : 
              winston.format.json()
          }),
        ],
      });

      // Avoid logging during tests to keep console clean, unless needed
      if (mode === 'test') {
        this.logger.transports.forEach((t) => (t.silent = true));
      }

      Logger.instance = this;
    }
    return Logger.instance;
  }

  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  error(message, error) {
    this.logger.error(message, { error: error?.message || error, stack: error?.stack });
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }
}

const loggerInstance = new Logger();
module.exports = loggerInstance;
