/**
 * @param {Date}    check
 * @param {Date}    from
 * @param {Date}    to
 * @returns {boolean}
 */
function isDateBetween(check, from, to) {
	return check.getTime() <= to.getTime() && check.getTime() >= from.getTime();
}

/**
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
	return date.toLocaleString();
}

/**
 * @param {number} ms
 * @returns {Date}
 */
function addMillisecondsToCurrentTimestamp(ms) {
	return new Date(new Date().getTime() + ms);
}

/**
 * @param {string}  hoursMinutes
 * @param {Date}    [date]
 * @return {Date}
 */
function hoursAndMinutesForDate(hoursMinutes, date) {
	if (date == null) {
		date = new Date();
	} else {
		date = new Date(date); // clone
	}

	const [hours, minutes] = hoursMinutes.split(':').map(Number);
	date.setHours(hours, minutes, 0);

	return date;
}

/**
 * @param {Date} forDay
 * @return {Date}
 */
function tomorrow(forDay) {
	const nextDay = new Date(forDay);
	nextDay.setDate(forDay.getDate() + 1);
	return nextDay;
}

export { isDateBetween, formatDate, addMillisecondsToCurrentTimestamp, hoursAndMinutesForDate, tomorrow };
