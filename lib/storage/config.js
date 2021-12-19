import Ajv from 'ajv';
import AjvLocalizeEn from 'ajv-i18n/localize/en/index.js';
import addFormats from 'ajv-formats';
import dialog from 'dialog';
import fs from 'fs';
import { loadJsonFile } from 'load-json-file';
import { writeJsonFile } from 'write-json-file';
import { APP_NAME, FILE_PATHS } from '../constants.js';
import { logger } from '../logger.js';
import Wallpaper from '../wallpaper/path.js';

const schema = {
	type: 'object',
	properties: {
		changeBy: {
			enum: ['sunlight', 'time']
		},
		wallpapersDir: {
			type: 'string',
			minLength: 1
		},
		location: {
			oneOf: [
				{
					type: 'string',
					minLength: 5
				},
				{
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
			]
		},
		wallpapers: {
			type: 'object'
		}
	},
	required: ['changeBy', 'wallpapers'],
	additionalProperties: false,
	allOf: [
		{
			if: {
				properties: {
					changeBy: {
						enum: ['sunlight']
					}
				},
				required: ['changeBy']
			},
			then: {
				properties: {
					wallpapers: {
						type: 'object',
						properties: {
							dawn: {
								type: 'string',
								minLength: 3
							},
							sunrise: {
								type: 'string',
								minLength: 3
							},
							noon: {
								type: 'string',
								minLength: 3
							},
							sunset: {
								type: 'string',
								minLength: 3
							},
							dusk: {
								type: 'string',
								minLength: 3
							},
							night: {
								type: 'string',
								minLength: 3
							}
						},
						additionalProperties: false
					}
				},
				required: ['location']
			}
		},
		{
			if: {
				properties: {
					changeBy: {
						enum: ['time']
					}
				},
				required: ['changeBy']
			},
			then: {
				properties: {
					location: false,
					wallpapers: {
						type: 'object',
						patternProperties: {
							'^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$': {
								type: 'string',
								minLength: 3
							}
						},
						minProperties: 2,
						additionalProperties: false
					}
				}
			}
		}
	]
};

const ajv = new Ajv({
	allErrors: true
});
addFormats(ajv);
const validator = ajv.compile(schema);

const JOIN_ERRORS_OPTIONS = { separator: '\n' };

/**
 * Validates config.
 * If it is not valid, will throw an {@link Error} with explanatory message.
 *
 * @param {Config}  config
 */
function validate(config) {
	const valid = validator(config);
	if (!valid) {
		AjvLocalizeEn(validator.errors);
		throw new Error(ajv.errorsText(validator.errors, JOIN_ERRORS_OPTIONS));
	}

	for (const [time, wallpaper] of Object.entries(config.wallpapers)) {
		if (Wallpaper.computePath(wallpaper, config.wallpapersDir) == null) {
			throw new Error(`Wallpaper path '${wallpaper}' for '${time}' doesn't seem to be a valid one!`);
		}
	}
}

/**
 * @return {Promise<Config | null>}
 */
async function read() {
	if (!fs.existsSync(FILE_PATHS.CONFIG)) {
		logger.warning('Config file does not exist.');
		return null;
	}

	let config = null;
	try {
		config = await loadJsonFile(FILE_PATHS.CONFIG);
	} catch (e) {
		logger.warning('Could not read config file.', e);
		return null;
	}

	try {
		validate(config);
	} catch (e) {
		logger.error(`Could not read config from disk as it is not valid: ${e.message}`);
		dialog.err(`Invalid config file!\n${e.message}`, APP_NAME);
		return null;
	}

	return config;
}

/**
 * @param {Config} config
 * @return {Promise<void>}
 */
async function write(config) {
	try {
		validate(config);
	} catch (e) {
		logger.error(`Could not write config as it is not valid: ${e.message}`);
		return;
	}

	try {
		await writeJsonFile(FILE_PATHS.CONFIG, config, { sortKeys: true });
	} catch (e) {
		logger.error('Could not write config to disk.', e);
	}
}

export default { validate, read, write };
