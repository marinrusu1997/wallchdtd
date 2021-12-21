import winston from 'winston';
import 'winston-daily-rotate-file';
import { PATHS, FILE_NAMES } from './constants.js';

const { combine, timestamp, align, errors, colorize, printf } = winston.format;

// eslint-disable-next-line import/no-mutable-exports
let logger = winston.createLogger({
	level: 'debug',
	levels: winston.config.syslog.levels,
	format: combine(
		timestamp({
			format: 'YYYY-MM-DD HH:mm:ss:SSS'
		}),
		align(),
		errors({ stack: true }),
		colorize({
			level: true,
			colors: {
				emerg: 'magenta',
				alert: 'magenta',
				crit: 'magenta',
				error: 'red',
				warning: 'yellow',
				notice: 'cyan',
				info: 'green',
				debug: 'blue'
			}
		}),
		printf(({ level, message, timestamp }) => {
			return `${timestamp} [${process.pid}] ${level}: ${message}`;
		})
	),
	transports: [
		new winston.transports.DailyRotateFile({
			filename: FILE_NAMES.LOG,
			dirname: PATHS.log,
			createSymlink: true,
			datePattern: 'YYYY-MM-DD',
			zippedArchive: true,
			maxSize: '1m',
			maxFiles: '2d'
		})
	]
});

// eslint-disable-next-line no-underscore-dangle
function __Rewire__(mock) {
	logger = mock;
}

// eslint-disable-next-line no-underscore-dangle
function __ResetDependency__() {
	logger = __ResetDependency__.setTimeoutOriginal;
}
__ResetDependency__.original = logger;

export { logger, __Rewire__, __ResetDependency__ };
