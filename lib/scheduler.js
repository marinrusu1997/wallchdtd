import { logger } from './logger.js';
import { addMillisecondsToTimestamp, formatDate } from './utils.js';
import { DEFAULT_WAKEUP_TIMEOUT_MS } from './constants.js';

let timeoutId = null;
let setTimeoutImpl = setTimeout;
let clearTimeoutImpl = clearTimeout;

/**
 * @param {Function}    func
 * @param {Date}        currentTime
 * @param {Date}        [date]
 */
function scheduleAt({ func, currentTime, date }) {
	if (date != null) {
		if (currentTime.getTime() >= date.getTime()) {
			logger.error(`Could not schedule func at given date '${date}', because is lower or equal with current time. Will schedule at default timeout.`);
			date = addMillisecondsToTimestamp(currentTime, DEFAULT_WAKEUP_TIMEOUT_MS);
		}
	} else {
		date = addMillisecondsToTimestamp(currentTime, DEFAULT_WAKEUP_TIMEOUT_MS);
	}

	stopSchedule();

	timeoutId = setTimeoutImpl(func, date.getTime() - currentTime.getTime());
	logger.debug(`Wallpaper changing scheduled at '${formatDate(date)}'.`);
}

/**
 * @param {function}    func
 * @param {Date}        currentTime
 * @param {number}      [timeout]
 */
function scheduleAfter(func, currentTime, timeout) {
	stopSchedule();

	if (timeout != null) {
		if (timeout <= 0 || timeout > 86400000) {
			logger.warning(`Could not change wallpaper after ${timeout} seconds.`);
			timeout = DEFAULT_WAKEUP_TIMEOUT_MS;
		}
	} else {
		timeout = DEFAULT_WAKEUP_TIMEOUT_MS;
	}

	timeoutId = setTimeoutImpl(func, timeout);

	const changeAt = addMillisecondsToTimestamp(currentTime, timeout);
	logger.debug(`Wallpaper changing scheduled at '${formatDate(changeAt)}'.`);
}

function stopSchedule() {
	if (timeoutId !== null) {
		clearTimeoutImpl(timeoutId);
		timeoutId = null;
	}
}

// eslint-disable-next-line no-underscore-dangle
function __Rewire__(setTimeoutMock, clearTimeoutMock) {
	setTimeoutImpl = setTimeoutMock;
	clearTimeoutImpl = clearTimeoutMock;
}

// eslint-disable-next-line no-underscore-dangle
function __ResetDependency__() {
	setTimeoutImpl = __ResetDependency__.setTimeoutOriginal;
	clearTimeoutImpl = __ResetDependency__.clearTimeoutOriginal;
}
__ResetDependency__.setTimeoutOriginal = setTimeoutImpl;
__ResetDependency__.clearTimeoutOriginal = clearTimeoutImpl;

export { scheduleAt, scheduleAfter, stopSchedule, __Rewire__, __ResetDependency__ };
