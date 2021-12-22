import { describe, it } from 'mocha';
import { expect } from 'chai';
import isObject from 'is-object';
import { getLocationCoordinates } from '../../lib/wallpaper/sunlight/location.js';

describe(`${getLocationCoordinates.name} spec`, () => {
	it('retrieves coordinates via internet', async () => {
		const coordinates = await getLocationCoordinates(
			{
				location: process.env.IPINFO_API_KEY
			},
			{}
		);
		expect(isObject(coordinates)).to.be.oneOf([true, false]);
	}).timeout(5000);

	it('retrieves coordinates from state', async () => {
		const coordinates = await getLocationCoordinates(
			{
				location: 'invalid_key'
			},
			{
				location: { lat: 24, long: 56 }
			}
		);
		expect(coordinates).to.be.deep.eq({ lat: 24, long: 56 });
	}).timeout(5000);

	it('returns null when coordinates from state could not be retrieved', async () => {
		const coordinates = await getLocationCoordinates(
			{
				location: 'invalid_key'
			},
			{}
		);
		expect(coordinates).to.be.eq(null);
	}).timeout(5000);
});
