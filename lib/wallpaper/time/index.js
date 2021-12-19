import { hoursAndMinutesForDate, tomorrow } from '../../utils.js';
import { computeWallpaperPath } from '../path.js';
import { logger } from '../../logger.js';

/**
 * This function changes wallpaper by times indicated in the daemon configuration.
 * Therefore, for each time of the day the specified wallpaper will be set.
 *
 * @param {Config} 							config				Daemon configuration.
 * @param {Date}							currentTime			Current time.
 * @param {(string) => Promise<void>}		wallpaperChanger	Function which actually changes wallpaper.
 *
 * @return {Promise<Date | null>}	When wallpaper was changed successfully, returns date when to schedule
 * 									the next wallpaper changing. <br/>
 * 									When wallpaper wasn't changed, returns **null**.
 */
async function changeWallpaperByTime({ config, currentTime, wallpaperChanger }) {
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

	const wallpaperPath = computeWallpaperPath(config.wallpapers[dateForWallpaper], config.wallpapersDir);
	if (wallpaperPath == null) {
		logger.warning(`Could not change wallpaper, because it's path could not be computed for '${dateForWallpaper}'.`);
		return null;
	}

	await wallpaperChanger(wallpaperPath);
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
