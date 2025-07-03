const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, errors } = format;

// Custom format that includes optional IP if present
const logFormat = printf(({ level, message, timestamp, stack, ip }) => {
  const base = `${timestamp} ${level}: ${stack || message}`;
  return ip ? `${base} | IP: ${ip}` : base;
});

const logger = createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
  exitOnError: false,
});

// Add a helper to log requests with IP
logger.request = (req, message, level = 'info') => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  logger.log({ level, message, ip });
};

module.exports = logger;
