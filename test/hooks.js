import { __Rewire__, __ResetDependency__ } from '../lib/logger.js';

const loggerMock = {
	emerg() {},
	alert() {},
	crit() {},
	error() {},
	warning() {},
	notice() {},
	info() {},
	debug() {}
};

const mochaHooks = {
	beforeEach() {
		__Rewire__(loggerMock);
	},
	afterEach() {
		__ResetDependency__();
	}
};

export { mochaHooks };
