import path from 'path';
import fs from 'fs';
import { logger } from '../logger.js';

/**
 * @param {string}      wallpaperName
 * @param {string|null} [basePath]
 *
 * @returns {string}
 */
function getPath(wallpaperName, basePath) {
	if (path.isAbsolute(wallpaperName)) {
		return wallpaperName;
	}

	if (basePath == null) {
		return wallpaperName;
	}

	return path.join(basePath, wallpaperName);
}

/**
 * @param {string|null}  [wallpaperName]
 * @param {string|null}  [basePath]
 *
 * @returns {string | null}
 */
function computeWallpaperPath(wallpaperName, basePath) {
	if (wallpaperName == null) {
		return null;
	}

	const wallpaperPath = getPath(wallpaperName, basePath);
	if (fs.existsSync(wallpaperPath)) {
		return wallpaperPath;
	}

	logger.warning(`Wallpaper ${wallpaperPath} does not exist.`);
	return null;
}

export { computeWallpaperPath };
