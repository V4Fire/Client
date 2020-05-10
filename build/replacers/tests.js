'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js'),
	config = require('config');

const
	path = require('upath'),
	glob = require('glob-promise');

const
	requireRgxp = /\/\/\s*@requireTests\n/g;

/**
 * Monic replacer for @requireTests declarations
 *
 * @param {string} str
 * @param {string} file
 * @returns {string}
 */
module.exports = async function (str, file) {
	if (!config.runtime().debug) {
		return str;
	}

	if (!requireRgxp.test(str)) {
		return str;
	}

	const tests = await $C([path.dirname(file)])
		.async
		.to([])
		.reduce(async (res, el) => res.concat(await glob(path.join(el, '/**/spec.js'))));

	return str.replace(requireRgxp, () => tests.map((el) => `import '${el}';\n`).join('\n'));
};
