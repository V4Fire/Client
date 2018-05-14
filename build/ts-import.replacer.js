'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	fs = require('fs'),
	path = require('path');

const
	{src} = require('config'),
	{config, resolve} = require('@pzlr/build-core'),
	{normalizeSep} = include('build/helpers');

const
	deps = [config.super, ...config.dependencies].map((el) => RegExp.escape(el || el.src)),
	importRgxp = new RegExp(`('|")(${deps.join('|')})(.*?)\\1`, 'g');

/**
 * Monic replacer for TS import declarations
 *
 * @param {string} str
 * @param {string} file
 * @returns {string}
 */
module.exports = function (str, file) {
	if (!deps.length) {
		return str;
	}

	return str.replace(importRgxp, (str, $1, root, url) => {
		let
			resource;

		if (config.superRgxp.test(root)) {
			for (let deps = resolve.rootDependencies, i = 0; i < deps.length; i++) {
				const
					el = deps[i],
					l = path.join(el, url);

				if (fs.existsSync(l)) {
					resource = l;
					break;
				}
			}
		}

		if (!resource && resolve.depMap[root]) {
			resource = path.join(src.lib(), root, resolve.depMap[root].config.sourceDir, url);
		}

		if (resource) {
			return `'${normalizeSep(path.relative(path.dirname(file), resource))}'`;
		}

		return str;
	});
};
