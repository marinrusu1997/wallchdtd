import Ajv from 'ajv';
import AjvLocalizeEn from 'ajv-i18n/localize/en/index.js';
import addFormats from 'ajv-formats';
import fs from 'fs';
import { loadJsonFile } from 'load-json-file';
import { writeJsonFile } from 'write-json-file';
import { FILE_PATHS } from '../constants.js';
import { logger } from '../logger.js';

const schema = {
	type: 'object',
	properties: {
		location: {
			type: 'object',
			properties: {
				lat: {
					type: 'number',
					minimum: -90,
					maximum: 90
				},
				long: {
					type: 'number',
					minimum: -180,
					maximum: 180
				}
			},
			required: ['lat', 'long'],
			additionalProperties: false
		}
	},
	required: ['location'],
	additionalProperties: false
};

const ajv = new Ajv({
	allErrors: true
});
addFormats(ajv);
const validator = ajv.compile(schema);

const JOIN_ERRORS_OPTIONS = { separator: '\n' };

/**
 * @param {State}  state
 */
function validate(state) {
	const valid = validator(state);
	if (!valid) {
		AjvLocalizeEn(validator.errors);
		throw new Error(ajv.errorsText(validator.errors, JOIN_ERRORS_OPTIONS));
	}
}

/**
 * @return {Promise<State | null>}
 */
async function read() {
	if (!fs.existsSync(FILE_PATHS.STATE)) {
		logger.warning('State file does not exist.');
		return null;
	}

	let state = null;
	try {
		state = await loadJsonFile(FILE_PATHS.STATE);
	} catch (e) {
		logger.warning('Could not read state from disk.', e);
		return null;
	}

	try {
		validate(state);
	} catch (e) {
		logger.error(`Could not read state from disk as it is not valid: ${e.message}`);
		return null;
	}

	return state;
}

/**
 * @param {State} state
 * @return {Promise<void>}
 */
async function write(state) {
	try {
		validate(state);
	} catch (e) {
		logger.error(`Could not write state as it is not valid: ${e.message}`);
		return;
	}

	try {
		await writeJsonFile(FILE_PATHS.STATE, state, { sortKeys: true });
	} catch (e) {
		logger.error('Could not write state to disk.', e);
	}
}

export default { read, write };
