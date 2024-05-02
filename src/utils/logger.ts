import { createLogger, format, transports } from 'winston';
const logLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'cyan',
  },
};

// Configure Winston logger
const logger = createLogger({
  level: 'info',
  levels: logLevels.levels,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(), 
        format.printf(({ level, message, timestamp }) => {
          const color = logLevels.colors[level as keyof typeof logLevels.colors] || 'white';
          return `\x1b[${color}m${timestamp} [${level}]: ${message}\x1b[0m`; // Apply color to log message
        })
      ),
    }),
  ],
});

// Add colors to the logger instance
const { combine, timestamp, printf, colorize } = format;
logger.add(
  new transports.Console({
    format: combine(
      colorize(),
      timestamp(),
      printf(({ level, message, timestamp }) => {
        const color = logLevels.colors[level as keyof typeof logLevels.colors] || 'white';
        return `\x1b[${color}m${timestamp} [${level}]: ${message}\x1b[0m`; 
      })
    ),
  })
);

export default logger;
