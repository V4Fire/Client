'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{webpack} = require('config');

/**
 * Returns a hash value from the specified file or text (glob pattern also supported)
 *
 * @param value
 * @param [length] - hash length
 * @returns {string}
 */
module.exports = function (value, length = webpack.hashLength) {
	const
		algorithm = webpack.hashFunction();

	if (!algorithm) {
		return '';
	}

	const
		path = require('path'),
		hasha = require('hasha'),
		hashFiles = require('hash-files');

	let
		res;

	if (Object.isString(value) && path.extname(value)) {
		res = hashFiles.sync({files: [value], algorithm});

	} else {
		res = hasha(value, {algorithm});
	}

	if (Number.isFinite(length)) {
		return res.substr(0, length);
	}

	return res;
};
