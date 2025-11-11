import winston from 'winston';
import path from 'path';

// Create logs directory path
const logsDir = path.join(process.cwd(), 'logs');

// Custom format for better readability
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }), // Include stack traces for errors
  winston.format.printf((info: winston.Logform.TransformableInfo) => {
    const { timestamp, level, message, stack } = info;
    if (stack) {
      return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`;
    }
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info', // Configurable via environment
  format: customFormat,
  transports: [
    // Console output (for development)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Add colors for console
        customFormat
      )
    }),

    // All logs (info and above) go to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5, // Keep 5 files
      tailable: true // Write newest logs first
    }),

    // Only errors go to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    }),

    // Daily rotating file for better organization
    new winston.transports.File({
      filename: path.join(logsDir, 'daily', 'app.log'),
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 14 // Keep 14 files
    })
  ],
  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log')
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log')
    })
  ]
});

// Export logger instance
export { logger };

// Export convenience methods (backward compatible)
export default logger;