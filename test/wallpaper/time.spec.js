import { describe, it } from 'mocha';
import { expect } from 'chai';
import { spy } from 'sinon';
import moment from 'moment';
import { changeWallpaperByTime } from '../../lib/wallpaper/time/index.js';
import { format } from '../utils.js';

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

	it('should change wallpaper when there is a single entry and return a date for tomorrow', async () => {
		const wallpaperChanger = spy();
		const currentTime = new Date();
		const config = {
			wallpapersDir: 'test/fixtures/wallpapers',
			wallpapers: {
				[`${time(currentTime)}`]: 'a.txt'
			}
		};

		expect(config.wallpapers[`${currentTime.getHours()}:${currentTime.getMinutes()}`]).to.be.eq('a.txt');

		const nextWallpaperChange = await changeWallpaperByTime({ config, currentTime, wallpaperChanger });
		expect(nextWallpaperChange).to.not.be.oneOf([null, undefined]);
		expect(nextWallpaperChange.toLocaleString()).to.be.eq(moment(currentTime).add(1, 'd').set({ seconds: 0 }).toDate().toLocaleString());
		expect(wallpaperChanger.callCount).to.be.eq(1);
		expect(wallpaperChanger.args[0]).to.be.equalTo(['test/fixtures/wallpapers/a.txt']);
	});

	it('should change wallpaper when there are 2 entries', async () => {
		const wallpaperChanger = spy();
		const morning = new Date('2021-06-01T07:58:03Z');
		const evening = new Date('2021-06-01T19:02:15Z');
		const config = {
			wallpapersDir: 'test/fixtures/wallpapers',
			wallpapers: {
				'08:00': 'a.txt',
				'19:00': 'b.txt'
			}
		};

		let nextWallpaperChange = await changeWallpaperByTime({
			config,
			currentTime: morning,
			wallpaperChanger
		});
		expect(nextWallpaperChange).to.not.be.oneOf([null, undefined]);
		expect(format(nextWallpaperChange)).to.be.eq('2021-06-01 16:00:00');
		expect(wallpaperChanger.callCount).to.be.eq(1);
		expect(wallpaperChanger.args[0]).to.be.equalTo(['test/fixtures/wallpapers/a.txt']);
		wallpaperChanger.resetHistory();

		nextWallpaperChange = await changeWallpaperByTime({
			config,
			currentTime: evening,
			wallpaperChanger
		});
		expect(nextWallpaperChange).to.not.be.oneOf([null, undefined]);
		expect(format(nextWallpaperChange)).to.be.eq('2021-06-02 05:00:00');
		expect(wallpaperChanger.callCount).to.be.eq(1);
		expect(wallpaperChanger.args[0]).to.be.equalTo(['test/fixtures/wallpapers/b.txt']);
	});

	it('should change wallpaper when there are 4 entries', async () => {
		const wallpaperChanger = spy();
		const config = {
			wallpapersDir: 'test/fixtures/wallpapers',
			wallpapers: {
				'00:01': 'a.txt',
				'08:00': 'b.txt',
				'19:00': 'c.txt',
				'24:00': 'd.txt'
			}
		};

		let nextWallpaperChange = await changeWallpaperByTime({
			config,
			currentTime: new Date('2021-06-01T20:59:45Z'),
			wallpaperChanger
		});
		expect(nextWallpaperChange).to.not.be.oneOf([null, undefined]);
		expect(format(nextWallpaperChange)).to.be.eq('2021-06-01 21:01:00');
		expect(wallpaperChanger.callCount).to.be.eq(1);
		expect(wallpaperChanger.args[0]).to.be.equalTo(['test/fixtures/wallpapers/d.txt']);
		wallpaperChanger.resetHistory();

		nextWallpaperChange = await changeWallpaperByTime({
			config,
			currentTime: nextWallpaperChange,
			wallpaperChanger
		});
		expect(nextWallpaperChange).to.not.be.oneOf([null, undefined]);
		expect(format(nextWallpaperChange)).to.be.eq('2021-06-02 05:00:00');
		expect(wallpaperChanger.callCount).to.be.eq(1);
		expect(wallpaperChanger.args[0]).to.be.equalTo(['test/fixtures/wallpapers/a.txt']);
		wallpaperChanger.resetHistory();

		nextWallpaperChange = await changeWallpaperByTime({
			config,
			currentTime: nextWallpaperChange,
			wallpaperChanger
		});
		expect(nextWallpaperChange).to.not.be.oneOf([null, undefined]);
		expect(format(nextWallpaperChange)).to.be.eq('2021-06-02 16:00:00');
		expect(wallpaperChanger.callCount).to.be.eq(1);
		expect(wallpaperChanger.args[0]).to.be.equalTo(['test/fixtures/wallpapers/b.txt']);
		wallpaperChanger.resetHistory();

		nextWallpaperChange = await changeWallpaperByTime({
			config,
			currentTime: nextWallpaperChange,
			wallpaperChanger
		});
		expect(nextWallpaperChange).to.not.be.oneOf([null, undefined]);
		expect(format(nextWallpaperChange)).to.be.eq('2021-06-02 21:00:00');
		expect(wallpaperChanger.callCount).to.be.eq(1);
		expect(wallpaperChanger.args[0]).to.be.equalTo(['test/fixtures/wallpapers/c.txt']);
		wallpaperChanger.resetHistory();

		nextWallpaperChange = await changeWallpaperByTime({
			config,
			currentTime: nextWallpaperChange,
			wallpaperChanger
		});
		expect(nextWallpaperChange).to.not.be.oneOf([null, undefined]);
		expect(format(nextWallpaperChange)).to.be.eq('2021-06-03 05:00:00');
		expect(wallpaperChanger.callCount).to.be.eq(1);
		expect(wallpaperChanger.args[0]).to.be.equalTo(['test/fixtures/wallpapers/a.txt']);
		wallpaperChanger.resetHistory();
	});
});
