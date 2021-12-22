import moment from 'moment';

/**
 * @param {Date}    		date
 * @param {Date}    		from
 * @param {Date}    		to
 * @param {IntervalType}	intervalType
 * @returns {boolean}
 */
function isDateBetween(date, from, to, intervalType) {
	switch (intervalType) {
		case '()':
			return date.getTime() > from.getTime() && date.getTime() < to.getTime();
		case '(]':
			return date.getTime() > from.getTime() && date.getTime() <= to.getTime();
		case '[)':
			return date.getTime() >= from.getTime() && date.getTime() < to.getTime();
		case '[]':
			return date.getTime() >= from.getTime() && date.getTime() <= to.getTime();
		default:
			throw new Error(`Unknown interval type: ${intervalType}`);
	}
}

/**
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
	return date.toLocaleString();
}

/**
 * @param {Date} 	timestamp
 * @param {number} 	ms
 * @returns {Date}
 */
function addMillisecondsToTimestamp(timestamp, ms) {
	return new Date(timestamp.getTime() + ms);
}

/**
 * @param {string}  hoursMinutes
 * @param {Date}    date
 * @return {Date}
 */
function hoursAndMinutesForDate(hoursMinutes, date) {
	date = new Date(date);

	const [hours, minutes] = hoursMinutes.split(':').map(Number);
	date.setHours(hours, minutes, 0);

	return date;
}

/**
 * @param {Date} forDay
 * @return {Date}
 */
function tomorrow(forDay) {
	return moment(forDay).add(1, 'd').toDate();
}

export { isDateBetween, formatDate, addMillisecondsToTimestamp, hoursAndMinutesForDate, tomorrow };
