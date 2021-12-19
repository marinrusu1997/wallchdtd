import { setWallpaper } from 'wallpaper';
import Config from '../storage/config.js';
import { logger } from '../logger.js';
import { scheduleAfter, scheduleAt, stopSchedule } from '../timer.js';
import { changeWallpaperBySunlight } from './sunlight/index.js';
import { changeWallpaperByTime } from './time/index.js';

async function changeWallpaper() {
	const config = await Config.read();
	if (config == null) {
		logger.warning(`Could not change wallpaper: unable to get config.`);
		scheduleAfter(changeWallpaper);
		return;
	}

	const currentTime = new Date();
	const wallpaperChanger = setWallpaper;

	try {
		switch (config.changeBy) {
			case 'sunlight': {
				const nextWallpaperChangeAt = await changeWallpaperBySunlight(config);
				scheduleAt(changeWallpaper, nextWallpaperChangeAt);
				return;
			}
			case 'time': {
				const nextWallpaperChangeAt = await changeWallpaperByTime({
					config,
					currentTime,
					wallpaperChanger
				});
				scheduleAt(changeWallpaper, nextWallpaperChangeAt);
				return;
			}
			default: {
				logger.warning(`Could not handle wallpaper changing by '${config.changeBy}'.`);
				scheduleAfter(changeWallpaper);
				return;
			}
		}
	} catch (e) {
		logger.error(`Unexpected error.`, e);
		scheduleAfter(changeWallpaper);
	}
}

function stopWallpaperChanging() {
	stopSchedule();
}

export { changeWallpaper, stopWallpaperChanging };
