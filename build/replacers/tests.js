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
	{resolve} = require('@pzlr/build-core');

const
	requireRgxp = /\/\/\s*@requireTests\n/g;

let
	specs;

/**
 * Monic replacer for @requireTests declarations
 *
 * @param {string} str
 * @returns {string}
 */
module.exports = async function (str) {
	if (!config.runtime().tests) {
		return str;
	}

	specs = specs || await $C([resolve.sourceDir].concat(resolve.rootDependencies))
		.async
		.to([])
		.reduce(async (res, el) => res.concat(await glob(path.join(el, '/**/*(*.spec.ts|spec.ts)'))));

	return str.replace(requireRgxp, () => specs.map((el) => `import '${el}';\n`).join('\n'));
};
