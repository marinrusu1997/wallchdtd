import { describe, it } from 'mocha';
import { expect } from 'chai';
import { spy, mock } from 'sinon';
import { changeWallpaperBySunlight } from '../../lib/wallpaper/sunlight/index.js';
import { format } from '../utils.js';

/** @type {StateManager} */
const stateManager = {
	read() {
		return Promise.resolve({});
	},
	write() {
		return Promise.resolve();
	}
};

describe(`${changeWallpaperBySunlight.name} spec`, () => {
	it('should return null when wallpaper was not changed', async () => {
		const sunrise = new Date('2021-06-01T07:58:03Z');
		const config = {
			location: {
				lat: 47,
				long: 28
			},
			wallpapers: {
				sunrise: '/some/invalid-path.jpg'
			}
		};
		const wallpaperChanger = spy();
		const stateManagerMock = mock(stateManager);
		stateManagerMock.expects('read').once();
		stateManagerMock.expects('write').once().withArgs({ location: config.location });

		const nextWallpaperChange = await changeWallpaperBySunlight({
			config,
			currentTime: sunrise,
			wallpaperChanger,
			stateManager
		});
		expect(nextWallpaperChange).to.not.be.oneOf([null, undefined]);
		expect(format(nextWallpaperChange)).to.be.eq('2021-06-01 10:07:17');
		expect(wallpaperChanger.callCount).to.be.eq(0);
		stateManagerMock.verify();
	});

	it('should change wallpaper for sunrise', async () => {
		const sunrise = new Date('2021-06-01T07:58:03Z');
		const config = {
			location: {
				lat: 47,
				long: 28
			},
			wallpapersDir: 'test/fixtures/wallpapers',
			wallpapers: {
				sunrise: 'a.txt'
			}
		};
		const wallpaperChanger = spy();

		let nextWallpaperChange = await changeWallpaperBySunlight({
			config,
			currentTime: sunrise,
			wallpaperChanger,
			stateManager
		});
		expect(nextWallpaperChange).to.not.be.oneOf([null, undefined]);
		expect(format(nextWallpaperChange)).to.be.eq('2021-06-01 10:07:17');
		expect(wallpaperChanger.callCount).to.be.eq(1);
		expect(wallpaperChanger.args[0]).to.be.equalTo(['test/fixtures/wallpapers/a.txt']);
		wallpaperChanger.resetHistory();

		nextWallpaperChange = await changeWallpaperBySunlight({
			config,
			currentTime: nextWallpaperChange,
			wallpaperChanger,
			stateManager
		});
		expect(nextWallpaperChange).to.not.be.oneOf([null, undefined]);
		expect(format(nextWallpaperChange)).to.be.eq('2021-06-01 17:52:27');
		expect(wallpaperChanger.callCount).to.be.eq(0);
		wallpaperChanger.resetHistory();
	});

	it('should change wallpaper for all sunlight times', async () => {
		const dawn = new Date('2021-06-01T01:42:26.612Z');
		const config = {
			location: {
				lat: 47,
				long: 28
			},
			wallpapersDir: 'test/fixtures/wallpapers',
			wallpapers: {
				dawn: 'a.txt', // 2021-06-01T01:39:48.812Z
				sunrise: 'b.txt', // 2021-06-01T02:18:21.495Z
				noon: 'c.txt', // 2021-06-01T10:07:17.840Z
				sunset: 'd.txt', // 2021-06-01T17:52:27.528Z
				dusk: 'e.txt', // 2021-06-01T18:34:46.868Z
				night: 'f.txt' // 2021-06-01T20:37:05.776Z
			}
		};
		const wallpaperChanger = spy();

		// Dawn
		let nextWallpaperChange = await changeWallpaperBySunlight({
			config,
			currentTime: dawn,
			wallpaperChanger,
			stateManager
		});
		expect(nextWallpaperChange).to.not.be.oneOf([null, undefined]);
		expect(format(nextWallpaperChange)).to.be.eq('2021-06-01 02:18:21');
		expect(wallpaperChanger.callCount).to.be.eq(1);
		expect(wallpaperChanger.args[0]).to.be.equalTo(['test/fixtures/wallpapers/a.txt']);
		wallpaperChanger.resetHistory();

		// Sunrise
		nextWallpaperChange = await changeWallpaperBySunlight({
			config,
			currentTime: nextWallpaperChange,
			wallpaperChanger,
			stateManager
		});
		expect(nextWallpaperChange).to.not.be.oneOf([null, undefined]);
		expect(format(nextWallpaperChange)).to.be.eq('2021-06-01 10:07:17');
		expect(wallpaperChanger.callCount).to.be.eq(1);
		expect(wallpaperChanger.args[0]).to.be.equalTo(['test/fixtures/wallpapers/b.txt']);
		wallpaperChanger.resetHistory();

		// Noon
		nextWallpaperChange = await changeWallpaperBySunlight({
			config,
			currentTime: nextWallpaperChange,
			wallpaperChanger,
			stateManager
		});
		expect(nextWallpaperChange).to.not.be.oneOf([null, undefined]);
		expect(format(nextWallpaperChange)).to.be.eq('2021-06-01 17:52:27');
		expect(wallpaperChanger.callCount).to.be.eq(1);
		expect(wallpaperChanger.args[0]).to.be.equalTo(['test/fixtures/wallpapers/c.txt']);
		wallpaperChanger.resetHistory();

		// Sunset
		nextWallpaperChange = await changeWallpaperBySunlight({
			config,
			currentTime: nextWallpaperChange,
			wallpaperChanger,
			stateManager
		});
		expect(nextWallpaperChange).to.not.be.oneOf([null, undefined]);
		expect(format(nextWallpaperChange)).to.be.eq('2021-06-01 18:34:46');
		expect(wallpaperChanger.callCount).to.be.eq(1);
		expect(wallpaperChanger.args[0]).to.be.equalTo(['test/fixtures/wallpapers/d.txt']);
		wallpaperChanger.resetHistory();

		// Dusk
		nextWallpaperChange = await changeWallpaperBySunlight({
			config,
			currentTime: nextWallpaperChange,
			wallpaperChanger,
			stateManager
		});
		expect(nextWallpaperChange).to.not.be.oneOf([null, undefined]);
		expect(format(nextWallpaperChange)).to.be.eq('2021-06-01 20:37:05');
		expect(wallpaperChanger.callCount).to.be.eq(1);
		expect(wallpaperChanger.args[0]).to.be.equalTo(['test/fixtures/wallpapers/e.txt']);
		wallpaperChanger.resetHistory();

		// Night
		nextWallpaperChange = await changeWallpaperBySunlight({
			config,
			currentTime: nextWallpaperChange,
			wallpaperChanger,
			stateManager
		});
		expect(nextWallpaperChange).to.not.be.oneOf([null, undefined]);
		expect(format(nextWallpaperChange)).to.be.eq('2021-06-02 01:39:05');
		expect(wallpaperChanger.callCount).to.be.eq(1);
		expect(wallpaperChanger.args[0]).to.be.equalTo(['test/fixtures/wallpapers/f.txt']);
		wallpaperChanger.resetHistory();
	});
});
