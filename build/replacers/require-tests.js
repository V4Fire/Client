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
 * Monic replacer that adds the "@requireTests" declaration which recursively includes all spec.js/*.spec.js files
 * relative to the file where it used
 *
 * @param {string} str
 * @param {string} filePath
 * @returns {string}
 *
 * @example
 * **bla/spec.js**
 * **bla/foo.spec.js**
 * **bla/bar/foo.spec.js**
 *
 * **bla/bla.js**
 *
 * ```js
 * // Includes all spec files from "/bla"
 * @requireTests
 * ```
 */
module.exports = async function requireTestsReplacer(str, filePath) {
	if (!config.runtime().debug) {
		return str;
	}

	if (!requireRgxp.test(str)) {
		return str;
	}

	const tests = await $C([path.dirname(filePath)])
		.async
		.to([])
		.reduce(async (res, el) => res.concat(await glob(path.join(el, '/**/@(spec.js|*.spec.js)'))));

	return str.replace(requireRgxp, () => tests.map((el) => `import '${el}';\n`).join('\n'));
};

Object.assign(module.exports, {
	requireRgxp
});
