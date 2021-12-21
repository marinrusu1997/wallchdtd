import { setWallpaper } from 'wallpaper';
import Config from '../storage/config.js';
import State from '../storage/state.js';
import { logger } from '../logger.js';
import { scheduleAfter, scheduleAt, stopSchedule } from '../scheduler.js';
import { changeWallpaperBySunlight } from './sunlight/index.js';
import { changeWallpaperByTime } from './time/index.js';

const wallpaperChanger = setWallpaper;

async function changeWallpaper() {
	const currentTime = new Date();

	const config = await Config.read();
	if (config == null) {
		logger.warning(`Could not change wallpaper: unable to get config.`);
		scheduleAfter(changeWallpaper, currentTime);
		return;
	}

	try {
		switch (config.changeBy) {
			case 'sunlight': {
				const nextWallpaperChangeAt = await changeWallpaperBySunlight({
					config,
					currentTime,
					wallpaperChanger,
					stateManager: State
				});
				scheduleAt({ func: changeWallpaper, currentTime, nextWallpaperChangeAt });
				return;
			}
			case 'time': {
				const nextWallpaperChangeAt = await changeWallpaperByTime({
					config,
					currentTime,
					wallpaperChanger
				});
				scheduleAt({ func: changeWallpaper, currentTime, nextWallpaperChangeAt });
				return;
			}
			default: {
				logger.warning(`Could not handle wallpaper changing by '${config.changeBy}'.`);
				scheduleAfter(changeWallpaper, currentTime);
				return;
			}
		}
	} catch (e) {
		logger.error(`Unexpected error.`, e);
		scheduleAfter(changeWallpaper, currentTime);
	}
}

function stopWallpaperChanging() {
	stopSchedule();
}

export { changeWallpaper, stopWallpaperChanging };
