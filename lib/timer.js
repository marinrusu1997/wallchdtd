import { logger } from './logger.js';
import { addMillisecondsToCurrentTimestamp, formatDate } from './utils.js';
import { DEFAULT_WAKEUP_TIMEOUT_MS } from './constants.js';

let timer = null;

/**
 * @param {function}    func
 * @param {Date}        [date]
 */
function scheduleAt(func, date) {
	const now = new Date();

	if (date != null) {
		if (now.getTime() >= date.getTime()) {
			logger.error(`Could not schedule func at given date '${date}', because is lower or equal with current time. Will schedule at default timeout.`);
			date = addMillisecondsToCurrentTimestamp(DEFAULT_WAKEUP_TIMEOUT_MS);
		}
	} else {
		date = addMillisecondsToCurrentTimestamp(DEFAULT_WAKEUP_TIMEOUT_MS);
	}

	stopSchedule();

	const timeout = date.getTime() - now.getTime();
	timer = setTimeout(func, timeout);

	logger.debug(`Wallpaper changing scheduled at '${formatDate(date)}'.`);
}

/**
 * @param {function}    func
 * @param {number}      [timeout]
 */
function scheduleAfter(func, timeout) {
	stopSchedule();

	if (timeout != null) {
		if (timeout <= 0 || timeout > 86400000) {
			logger.warning(`Could not change wallpaper after ${timeout} seconds.`);
			timeout = DEFAULT_WAKEUP_TIMEOUT_MS;
		}
	} else {
		timeout = DEFAULT_WAKEUP_TIMEOUT_MS;
	}

	timer = setTimeout(func, timeout);

	const changeAt = addMillisecondsToCurrentTimestamp(timeout);
	logger.debug(`Wallpaper changing scheduled at '${formatDate(changeAt)}'.`);
}

function stopSchedule() {
	if (timer !== null) {
		clearTimeout(timer);
		timer = null;
	}
}

export { scheduleAt, scheduleAfter, stopSchedule };
