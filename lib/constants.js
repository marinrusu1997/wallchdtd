import envPaths from 'env-paths';
import path from 'path';

const APP_NAME = 'wallchdtd';
const PATHS = envPaths(APP_NAME, { suffix: '' });

const FILE_NAMES = {
	CONFIG: 'conf.json',
	STATE: 'state.json',
	LOG: `${APP_NAME}-%DATE%.log`,
	PID: `${APP_NAME}.pid`
};

const FILE_PATHS = {
	CONFIG: path.join(PATHS.config, FILE_NAMES.CONFIG),
	STATE: path.join(PATHS.data, FILE_NAMES.STATE),
	PID: path.join(PATHS.temp, FILE_NAMES.PID)
};

const FILE_DIRS = {
	PID: PATHS.temp
};

const DEFAULT_WAKEUP_TIMEOUT_MS = 3600000;

export { APP_NAME, PATHS, FILE_NAMES, FILE_PATHS, FILE_DIRS, DEFAULT_WAKEUP_TIMEOUT_MS };
