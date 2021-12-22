import fs from 'fs';
import { FILE_DIRS, FILE_PATHS } from '../constants.js';
import { logger } from '../logger.js';

/**
 * @param {function} cleanupHandler
 */
function createFileSync(cleanupHandler) {
	if (fs.existsSync(FILE_PATHS.PID)) {
		throw new Error(`Pid file '${FILE_PATHS.PID}' already exists.`);
	}

	if (!fs.existsSync(FILE_DIRS.PID)) {
		fs.mkdirSync(FILE_DIRS.PID, { recursive: true });
	}

	fs.writeFileSync(FILE_PATHS.PID, `${process.pid}`);
	logger.info(`Created pid file at ${FILE_PATHS.PID}`);

	process.on('SIGINT', deleteFileSync(cleanupHandler));
	process.on('SIGTERM', deleteFileSync(cleanupHandler));
}

function deleteFileSync(cleanupHandler) {
	return () => {
		try {
			fs.unlinkSync(FILE_PATHS.PID);
			logger.info(`Deleted pid file ${FILE_PATHS.PID}`);
		} catch (e) {
			logger.error('Something went wrong while deleting the pid file!', e);
		}

		if (cleanupHandler) {
			cleanupHandler();
		}

		// eslint-disable-next-line no-process-exit
		process.exit(0);
	};
}

export default { createFileSync };
