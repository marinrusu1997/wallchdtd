import { getLocationCoordinates } from './location.js';
import { logger } from '../../logger.js';
import { getCurrentPartOfTheDay, getStartingTimeForNextPartOfTheDayAfter } from './day.js';
import { computeWallpaperPath } from '../path.js';

/**
 * Changes wallpapers by sunlight. Available positions are: <br/>
 * * *dawn*
 * * *sunrise*
 * * *noon*
 * * *sunset*
 * * *dusk*
 * * *night*
 * <br/>
 * Time for these positions are [automatically computed](https://www.npmjs.com/package/suncalc)
 * based on location from daemon config.
 *
 * @param {Config}              config             	Daemon configuration.
 * @param {Date}                currentTime        	Current time.
 * @param {WallpaperChanger}	wallpaperChanger   	Function which actually changes wallpaper.
 * @param {StateManager}		stateManager		State manager.
 *
 * @return {Promise<Date | null>}    When wallpaper was changed successfully, returns date when to schedule
 *                                   the next wallpaper changing. <br/>
 *                                   When wallpaper wasn't changed, returns **null**.
 */
async function changeWallpaperBySunlight({ config, currentTime, wallpaperChanger, stateManager }) {
	const state = (await stateManager.read()) || {};
	const location = await getLocationCoordinates(config, state);
	if (location == null) {
		logger.warning(`Could not change wallpaper, because location coordinates could not be obtained.`);
		return null;
	}
	state.location = location;
	await stateManager.write(state);

	const currentPartOfTheDay = getCurrentPartOfTheDay(location, currentTime);

	const wallpaperPath = computeWallpaperPath(config.wallpapers[currentPartOfTheDay], config.wallpapersDir);
	if (wallpaperPath == null) {
		logger.warning(`Could not change wallpaper for '${currentPartOfTheDay}', because wallpaper path could not be computed.`);
	} else {
		await wallpaperChanger(wallpaperPath);
		logger.info(`Wallpaper changed to '${wallpaperPath}'.`);
	}

	return getStartingTimeForNextPartOfTheDayAfter(currentPartOfTheDay, location, currentTime);
}

export { changeWallpaperBySunlight };
