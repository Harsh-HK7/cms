const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // API logs
    new winston.transports.File({
      filename: path.join(logsDir, 'api.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Helper functions for different log types
const logAPI = (level, message, meta = {}) => {
  logger.log(level, message, { ...meta, type: 'API' });
};

const logAuth = (level, message, meta = {}) => {
  logger.log(level, message, { ...meta, type: 'AUTH' });
};

const logDatabase = (level, message, meta = {}) => {
  logger.log(level, message, { ...meta, type: 'DATABASE' });
};

const logBusiness = (level, message, meta = {}) => {
  logger.log(level, message, { ...meta, type: 'BUSINESS' });
};

module.exports = {
  logger,
  logAPI,
  logAuth,
  logDatabase,
  logBusiness
}; 