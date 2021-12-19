import { setWallpaper } from 'wallpaper';
import State from '../../storage/state.js';
import { getLocationCoordinates } from './location.js';
import { logger } from '../../logger.js';
import { getCurrentPartOfTheDay, getStartingTimeForNextPartOfTheDayAfter } from './day.js';
import { computeWallpaperPath } from '../path.js';

/**
 * @param {Config}          config
 *
 * @returns {Promise<Date | null>}  When to do next wallpaper changing.
 *                                  When wallpaper was not changed, returns null.
 */
async function changeWallpaperBySunlight(config) {
	const state = (await State.read()) || {};
	const location = await getLocationCoordinates(config, state);
	if (location == null) {
		logger.warning(`Could not change wallpaper, because location coordinates could not be obtained.`);
		return null;
	}
	state.location = location;
	await State.write(state);

	const currentPartOfTheDay = getCurrentPartOfTheDay(location);

	const wallpaperPath = computeWallpaperPath(config.wallpapers[currentPartOfTheDay], config.wallpapersDir);
	if (wallpaperPath == null) {
		logger.warning(`Could not change wallpaper for '${currentPartOfTheDay}', because wallpaper path could not be computed.`);
		return null;
	}
	await setWallpaper(wallpaperPath);
	logger.info(`Wallpaper changed to '${wallpaperPath}'.`);

	return getStartingTimeForNextPartOfTheDayAfter(currentPartOfTheDay, location);
}

export { changeWallpaperBySunlight };
