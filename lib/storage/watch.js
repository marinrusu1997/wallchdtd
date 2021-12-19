import chokidar from 'chokidar';
import fs from 'fs';
import { FILE_PATHS, PATHS } from '../constants.js';
import { logger } from '../logger.js';

/** @type {FSWatcher} */
let watcher;

/**
 * @param {function} onChange
 */
function watch(onChange) {
	if (!fs.existsSync(PATHS.config)) {
		fs.mkdirSync(PATHS.config, { recursive: true });
	}

	watcher = chokidar.watch(PATHS.config, {
		ignoreInitial: true,
		disableGlobbing: true,
		useFsEvents: true,
		depth: 1,
		awaitWriteFinish: true,
		usePolling: true
	});

	watcher.on('ready', () => logger.info(`Watching ${JSON.stringify(watcher.getWatched())} for changes.`));
	watcher.on('add', (path) => {
		if (path !== FILE_PATHS.CONFIG) {
			return;
		}
		onChange();
	});
	watcher.on('change', (path) => {
		if (path !== FILE_PATHS.CONFIG) {
			return;
		}
		onChange();
	});
	watcher.on('unlink', (path) => {
		if (path !== FILE_PATHS.CONFIG) {
			return;
		}
		onChange();
	});
	watcher.on('error', (error) => logger.error('Watcher error.', error));
}

function unwatch() {
	if (watcher) {
		logger.info(`Unwatching ${PATHS.config}`);
		watcher.unwatch(PATHS.config);
	}
}

export default { watch, unwatch };
