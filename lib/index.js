#!/usr/bin/env node

import daemonizeProcess from 'daemonize-process';
import { logger } from './logger.js';
import pid from './storage/pid.js';
import Watcher from './storage/watch.js';
import { APP_NAME } from './constants.js';
import { changeWallpaper, stopWallpaperChanging } from './wallpaper/index.js';

function cleanup() {
	Watcher.unwatch();
	stopWallpaperChanging();
}

/** DETECT PLATFORM */
if (process.platform !== 'linux') {
	throw new Error(`${APP_NAME} can be run only on Linux platforms.`);
}

/** SETUP PROCESS */
daemonizeProcess();

process.title = APP_NAME;
process.on('uncaughtException', (e) => {
	logger.error(`Caught uncaught exception. Shutting down.\n${e.stack}`);
	cleanup();
});
process.on('unhandledRejection', (reason) => {
	logger.error(`Unhandled rejection: ${reason}`);
});
process.on('warning', (warning) => {
	logger.warning(`${warning.name} ${warning.message} ${warning.stack}`);
});

/** LOCK DAEMON PROCESS */
pid.createFileSync(cleanup);

/** WATCH FOR CONFIG CHANGES AND REACT TO THEM */
Watcher.watch(changeWallpaper);

/** START BUSINESS LOGIC */
changeWallpaper();
