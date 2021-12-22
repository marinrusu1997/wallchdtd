import suncalc from 'suncalc';
import { isDateBetween, tomorrow } from '../../utils.js';
import { logger } from '../../logger.js';

/**
 * @param {GeoCoordinates} 	coordinates
 * @param {Date}			currentTime
 * @returns {PartsOfDay}
 */
function getCurrentPartOfTheDay(coordinates, currentTime) {
	const sunTimes = suncalc.getTimes(currentTime, coordinates.lat, coordinates.long);
	const intervalType = '[)';

	if (isDateBetween(currentTime, getStartingTimeForPartOfDay('dawn', sunTimes), getStartingTimeForPartOfDay('sunrise', sunTimes), intervalType)) {
		return 'dawn';
	}

	if (isDateBetween(currentTime, getStartingTimeForPartOfDay('sunrise', sunTimes), getStartingTimeForPartOfDay('noon', sunTimes), intervalType)) {
		return 'sunrise';
	}

	if (isDateBetween(currentTime, getStartingTimeForPartOfDay('noon', sunTimes), getStartingTimeForPartOfDay('sunset', sunTimes), intervalType)) {
		return 'noon';
	}

	if (isDateBetween(currentTime, getStartingTimeForPartOfDay('sunset', sunTimes), getStartingTimeForPartOfDay('dusk', sunTimes), intervalType)) {
		return 'sunset';
	}

	if (isDateBetween(currentTime, getStartingTimeForPartOfDay('dusk', sunTimes), getStartingTimeForPartOfDay('night', sunTimes), intervalType)) {
		return 'dusk';
	}

	return 'night';
}

/**
 * @param {PartsOfDay}      partOfDay
 * @param {GeoCoordinates}  coordinates
 * @param {Date}			currentTime
 * @return {Date|null}
 */
function getStartingTimeForNextPartOfTheDayAfter(partOfDay, coordinates, currentTime) {
	const sunTimesForCurrentTime = suncalc.getTimes(currentTime, coordinates.lat, coordinates.long);
	logger.debug(
		`Sun times for ${partOfDay} ${currentTime.toLocaleString()}:\n` +
			`\t➡ Dawn 		${getStartingTimeForPartOfDay('dawn', suncalc.getTimes(tomorrow(currentTime), coordinates.lat, coordinates.long)).toLocaleString()}\n` +
			`\t➡ Sunrise	${getStartingTimeForPartOfDay('sunrise', sunTimesForCurrentTime).toLocaleString()}\n` +
			`\t➡ Noon 		${getStartingTimeForPartOfDay('noon', sunTimesForCurrentTime).toLocaleString()}\n` +
			`\t➡ Sunset	${getStartingTimeForPartOfDay('sunset', sunTimesForCurrentTime).toLocaleString()}\n` +
			`\t➡ Dusk		${getStartingTimeForPartOfDay('dusk', sunTimesForCurrentTime).toLocaleString()}\n` +
			`\t➡ Night		${getStartingTimeForPartOfDay('night', sunTimesForCurrentTime).toLocaleString()}\n`
	);

	switch (partOfDay) {
		case 'dawn':
			return getStartingTimeForPartOfDay('sunrise', sunTimesForCurrentTime);
		case 'sunrise':
			return getStartingTimeForPartOfDay('noon', sunTimesForCurrentTime);
		case 'noon':
			return getStartingTimeForPartOfDay('sunset', sunTimesForCurrentTime);
		case 'sunset':
			return getStartingTimeForPartOfDay('dusk', sunTimesForCurrentTime);
		case 'dusk':
			return getStartingTimeForPartOfDay('night', sunTimesForCurrentTime);
		case 'night': {
			const sunTimesForTomorrow = suncalc.getTimes(tomorrow(currentTime), coordinates.lat, coordinates.long);
			return getStartingTimeForPartOfDay('dawn', sunTimesForTomorrow);
		}
		default:
			logger.error(`Unknown part of the day '${partOfDay}'.`);
			return null;
	}
}

/**
 * @param {PartsOfDay}  partOfDay
 * @param {object}  	sunTimes
 * @returns {Date}
 */
function getStartingTimeForPartOfDay(partOfDay, sunTimes) {
	switch (partOfDay) {
		case 'dawn':
			return sunTimes.dawn;
		case 'sunrise':
			return sunTimes.sunrise;
		case 'noon':
			return sunTimes.solarNoon;
		case 'sunset':
			return sunTimes.sunsetStart;
		case 'dusk':
			return sunTimes.dusk;
		case 'night':
			return sunTimes.night;
		default:
			throw new Error(`Unknown part of the day '${partOfDay}'.`);
	}
}

export { getCurrentPartOfTheDay, getStartingTimeForNextPartOfTheDayAfter };
