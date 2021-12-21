import moment from 'moment';

/**
 * @param {Date} date
 * @returns {string}
 */
function format(date) {
	return moment(date).utcOffset(0).format('YYYY-MM-DD HH:mm:ss');
}

export { format };
