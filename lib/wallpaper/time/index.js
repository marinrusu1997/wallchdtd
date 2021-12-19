import { setWallpaper } from 'wallpaper';
import { hoursAndMinutesForDate, tomorrow } from '../../utils.js';
import Wallpaper from '../path.js';
import { logger } from '../../logger.js';

/**
 * @param {Config} config
 * @return {Promise<Date | null>}
 */
async function changeWallpaperByTime(config) {
	const currentTime = new Date();
	const dates = new Map(Object.keys(config.wallpapers).map((time) => [time, hoursAndMinutesForDate(time, currentTime)]));

	let dateForWallpaper;
	let minDelta = Number.MAX_SAFE_INTEGER;
	for (const [time, date] of dates.entries()) {
		const delta = Math.abs(currentTime.getTime() - date.getTime());
		if (delta < minDelta) {
			minDelta = delta;
			dateForWallpaper = time;
		}
	}

	const wallpaperPath = Wallpaper.computePath(config.wallpapers[dateForWallpaper], config.wallpapersDir);
	if (wallpaperPath == null) {
		logger.warning(`Could not change wallpaper, because it's path could not be computed for '${dateForWallpaper}'.`);
		return null;
	}

	await setWallpaper(wallpaperPath);
	logger.info(`Wallpaper changed to '${wallpaperPath}'.`);

	const sortedDates = Array.from(dates.keys()).sort();
	const currentIndex = sortedDates.findIndex((time) => time === dateForWallpaper);

	if (sortedDates.length !== 0 && currentIndex !== -1) {
		if (currentIndex === sortedDates.length) {
			return hoursAndMinutesForDate(sortedDates[0], tomorrow(currentTime));
		}
		return hoursAndMinutesForDate(sortedDates[currentIndex + 1], currentTime);
	}

	return null;
}

export { changeWallpaperByTime };
