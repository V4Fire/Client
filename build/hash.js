'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{build} = require('config');

/**
 * Returns a hash value of the specified file or text (glob pattern also supported)
 *
 * @param value - path to the file or text content
 * @param [length] - hash length
 * @returns {string}
 */
module.exports = function getHash(value, length = build.hashLength) {
	const
		algorithm = build.hashAlg;

	if (!algorithm) {
		return '';
	}

	const
		path = require('upath'),
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
