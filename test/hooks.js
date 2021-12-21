import chai from 'chai';
import assertArrays from 'chai-arrays';
import { config as configTestEnv } from 'dotenv';
import { __Rewire__, __ResetDependency__ } from '../lib/logger.js';

configTestEnv();

chai.use(assertArrays);

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
