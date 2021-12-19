import { describe, it } from 'mocha';
import { expect } from 'chai';
import { spy } from 'sinon';
import moment from 'moment';
import { changeWallpaperByTime } from '../../../lib/wallpaper/time/index.js';

const time = (date) => moment(date).format('H:m');

describe(`${changeWallpaperByTime.name} spec`, () => {
	it('should return null when wallpaper was not changed', async () => {
		const wallpaperChanger = spy();
		const currentTime = new Date();
		const config = {
			wallpapers: {
				[`${time(currentTime)}`]: 'invalid-path.jpg'
			}
		};

		expect(config.wallpapers[`${currentTime.getHours()}:${currentTime.getMinutes()}`]).to.be.eq('invalid-path.jpg');

		const nextWallpaperChange = await changeWallpaperByTime({ config, currentTime, wallpaperChanger });
		expect(nextWallpaperChange).to.be.eq(null);
		expect(wallpaperChanger.callCount).to.be.eq(0);
	});
});
