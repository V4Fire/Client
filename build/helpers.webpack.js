'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	path = require('path'),
	isProdEnv = process.env.NODE_ENV === 'production',
	cwd = process.cwd();

const
	HASH_LENGTH = 15;

/**
 * Returns WebPack output path string from the specified with hash parameters
 * (for longterm cache)
 *
 * @param {string} output - source string
 * @param {boolean=} [chunk] - if true, then the specified output is a chunk
 */
exports.hash = function (output, chunk) {
	// FIXME: webpack commonChunksPlugin chunkhash bug
	// return str.replace(/\[hash]_/g, isProdEnv ? chunk ? `[chunkhash:${HASH_LENGTH}]_` : `[hash:${HASH_LENGTH}]_` : '');
	return output.replace(/\[hash]_/g, isProdEnv ? `[hash:${HASH_LENGTH}]_` : '');
};

/**
 * Returns full path to the specified file relative to process.cwd()
 *
 * @param {string} file
 * @returns {string}
 */
exports.d = function (file) {
	return path.join(cwd, file);
};
