import fetch from 'node-fetch';
import publicIp from 'public-ip';
import isObject from 'is-object';
import { logger } from '../../logger.js';

/**
 * @param {string}  ip
 * @param {string}  token
 * @returns {Promise<GeoIpLocation>}
 */
async function getLocationByIp(ip, token) {
	return (await fetch(`https://ipinfo.io/${ip}?token=${token}`)).json();
}

/**
 * @param  {string} token
 * @returns {Promise<GeoCoordinates>}
 */
async function getLocationCoordinatesViaInternet(token) {
	const machineIp = await publicIp.v4();
	const location = await getLocationByIp(machineIp, token);
	if (!location || typeof location.loc !== 'string') {
		throw new Error(`Location obtained from internet '${JSON.stringify(location)}' does not contain coordinates.`);
	}

	const parsedCoordinates = location.loc.split(',').map(Number);
	return {
		lat: parsedCoordinates[0],
		long: parsedCoordinates[1]
	};
}

/**
 * @param {Config}          config
 * @param {State | null}    state
 * @returns {Promise<GeoCoordinates | null>}
 */
async function getLocationCoordinates(config, state) {
	if (isObject(config.location)) {
		return config.location;
	}

	if (typeof config.location === 'string') {
		try {
			return await getLocationCoordinatesViaInternet(config.location);
		} catch (e) {
			logger.error('Could not get machine coordinates via internet. Will use previously saved coordinates.', e);

			if (isObject(state) && isObject(state.location)) {
				return state.location;
			}

			logger.warning('Could not get previously saved coordinates.');
		}
	}

	return null;
}

export { getLocationCoordinates };
