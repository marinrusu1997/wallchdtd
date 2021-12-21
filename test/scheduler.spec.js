import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import { spy, stub } from 'sinon';
import moment from 'moment';
import { scheduleAfter, scheduleAt, __Rewire__, __ResetDependency__, stopSchedule } from '../lib/scheduler.js';
import { DEFAULT_WAKEUP_TIMEOUT_MS } from '../lib/constants.js';

const func = /** @type {function} */ spy();
const setTimeoutStub = stub();
setTimeoutStub.returns(1);
const clearTimeoutSpy = spy();

describe('scheduler spec', () => {
	beforeEach(() => {
		__Rewire__(setTimeoutStub, clearTimeoutSpy);
	});
	afterEach(() => {
		stopSchedule();

		__ResetDependency__();
		setTimeoutStub.resetHistory();
		clearTimeoutSpy.resetHistory();
	});

	describe(`${scheduleAt.name} spec`, () => {
		it('stops previous timeout before making a new one', () => {
			const currentTime = new Date();

			scheduleAt({ func, currentTime });
			expect(setTimeoutStub.callCount).to.be.eq(1);
			expect(setTimeoutStub.args[0][1]).to.be.eq(DEFAULT_WAKEUP_TIMEOUT_MS);
			expect(clearTimeoutSpy.callCount).to.be.eq(0);

			scheduleAt({ func, currentTime });
			expect(setTimeoutStub.callCount).to.be.eq(2);
			expect(setTimeoutStub.args[1][1]).to.be.eq(DEFAULT_WAKEUP_TIMEOUT_MS);
			expect(clearTimeoutSpy.callCount).to.be.eq(1);
			expect(clearTimeoutSpy.args[0][0]).to.be.eq(setTimeoutStub.returnValues[0]);
		});

		it('should schedule func at given date', () => {
			const currentTime = new Date();
			const date = moment(currentTime).add(1, 'minute').toDate();

			scheduleAt({ func, currentTime, date });
			expect(setTimeoutStub.callCount).to.be.eq(1);
			expect(setTimeoutStub.args).to.be.ofSize(1);
			expect(setTimeoutStub.args[0]).to.be.ofSize(2);
			expect(setTimeoutStub.args[0][1]).to.be.eq(date.getTime() - currentTime.getTime());
		});

		it('defaults to predefined timeout when given date is not valid', () => {
			const currentTime = new Date();
			const date = moment(currentTime).subtract(1, 'second').toDate();

			scheduleAt({ func, currentTime, date });
			expect(setTimeoutStub.callCount).to.be.eq(1);
			expect(setTimeoutStub.args).to.be.ofSize(1);
			expect(setTimeoutStub.args[0]).to.be.ofSize(2);
			expect(setTimeoutStub.args[0][1]).to.be.eq(DEFAULT_WAKEUP_TIMEOUT_MS);
		});

		it('defaults to predefined timeout when date is not given', () => {
			const currentTime = new Date();

			scheduleAt({ func, currentTime });
			expect(setTimeoutStub.callCount).to.be.eq(1);
			expect(setTimeoutStub.args).to.be.ofSize(1);
			expect(setTimeoutStub.args[0]).to.be.ofSize(2);
			expect(setTimeoutStub.args[0][1]).to.be.eq(DEFAULT_WAKEUP_TIMEOUT_MS);
		});
	});

	describe(`${scheduleAfter.name} spec`, () => {
		it('stops previous timeout before making a new one', () => {
			const currentTime = new Date();

			scheduleAfter(func, currentTime);
			expect(setTimeoutStub.callCount).to.be.eq(1);
			expect(setTimeoutStub.args[0][1]).to.be.eq(DEFAULT_WAKEUP_TIMEOUT_MS);
			expect(clearTimeoutSpy.callCount).to.be.eq(0);

			scheduleAfter(func, currentTime);
			expect(setTimeoutStub.callCount).to.be.eq(2);
			expect(setTimeoutStub.args[1][1]).to.be.eq(DEFAULT_WAKEUP_TIMEOUT_MS);
			expect(clearTimeoutSpy.callCount).to.be.eq(1);
			expect(clearTimeoutSpy.args[0][0]).to.be.eq(setTimeoutStub.returnValues[0]);
		});

		it('should schedule func at given timeout', () => {
			const currentTime = new Date();
			const timeout = 100;

			scheduleAfter(func, currentTime, timeout);
			expect(setTimeoutStub.callCount).to.be.eq(1);
			expect(setTimeoutStub.args).to.be.ofSize(1);
			expect(setTimeoutStub.args[0]).to.be.ofSize(2);
			expect(setTimeoutStub.args[0][1]).to.be.eq(timeout);
		});

		it('defaults to predefined timeout when given timeout is not valid', () => {
			const currentTime = new Date();

			scheduleAfter(func, currentTime, 0);
			expect(setTimeoutStub.callCount).to.be.eq(1);
			expect(setTimeoutStub.args).to.be.ofSize(1);
			expect(setTimeoutStub.args[0]).to.be.ofSize(2);
			expect(setTimeoutStub.args[0][1]).to.be.eq(DEFAULT_WAKEUP_TIMEOUT_MS);

			scheduleAfter(func, currentTime, 86400001);
			expect(setTimeoutStub.callCount).to.be.eq(2);
			expect(setTimeoutStub.args).to.be.ofSize(2);
			expect(setTimeoutStub.args[0]).to.be.ofSize(2);
			expect(setTimeoutStub.args[1][1]).to.be.eq(DEFAULT_WAKEUP_TIMEOUT_MS);
		});

		it('defaults to predefined timeout when timeout is not given', () => {
			const currentTime = new Date();

			scheduleAfter(func, currentTime);
			expect(setTimeoutStub.callCount).to.be.eq(1);
			expect(setTimeoutStub.args).to.be.ofSize(1);
			expect(setTimeoutStub.args[0]).to.be.ofSize(2);
			expect(setTimeoutStub.args[0][1]).to.be.eq(DEFAULT_WAKEUP_TIMEOUT_MS);
		});
	});
});
