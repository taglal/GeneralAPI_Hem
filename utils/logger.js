const winston = require('winston');

const logFormat = winston.format.printf(( { timestamp, level, message } ) => {
    return `[${timestamp}] ${level}: ${message}`
});                                                                         // Custom log format

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm' }),       // Add timestamp to log messages
    transports: [
        new winston.transports.Console({                                    // Log to console
            format: winston.format.combine(
                winston.format.colorize(),                                  // Colorize the log level only for console output
                logFormat
            )
        }),
        new winston.transports.File({                                       // Log to file
            filename: 'server.log',
            format: logFormat
        })
    ]
});

module.exports = logger;
