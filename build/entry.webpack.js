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

const
	path = require('upath'),
	graph = include('build/graph.webpack');

/**
 * Returns an options object of the webpack entry point
 *
 * @param {string} name - entry point name
 * @param {string} src - entry point src
 * @returns {!Object}
 */
module.exports = async function entry(name, src) {
	const
		g = await graph,
		dependencies = (g.dependencies[name] ?? []).filter((nm) => g.dependencies[nm]);

	const
		isTpl = /_tpl$/;

	if (isTpl.test(name)) {
		dependencies.push(name.replace(isTpl, ''), name);
	}

	if (path.extname(src) === '.styl' && !webpack.dynamicPublicPath()) {
		src += '?static';
	}

	return {
		import: src,
		dependOn: dependencies.length > 1 ? dependencies.slice(0, -1) : undefined
	};
};
