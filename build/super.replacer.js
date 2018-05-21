'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js');

const
	fs = require('fs'),
	path = require('upath');

const
	isPathInside = require('is-path-inside'),
	{pathEqual} = require('path-equal');

const {
	config: pzlr,
	resolve
} = require('@pzlr/build-core');

const exts = $C(include('build/resolve.webpack').extensions).to([]).reduce((list, ext) => {
	list.push(ext);
	list.push(`/index${ext}`);
	return list;
});

const
	deps = pzlr.dependencies,
	importRgxp = new RegExp(`('|")(${RegExp.escape(pzlr.super)})(/.*?|(?=\\1))\\1`, 'g');

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

	let start = 0;
	for (let o = resolve.rootDependencies, i = 0; i < o.length; i++) {
		if (isPathInside(file, o[i])) {
			start = i + 1;
			break;
		}
	}

	const
		isTS = path.extname(file) === '.ts';

	return str.replace(importRgxp, (str, $1, root, url) => {
		let
			resource;

		loop: for (let o = resolve.rootDependencies, i = start; i < o.length; i++) {
			const
				dep = deps[i],
				l = path.join(o[i], url);

			if (path.extname(l)) {
				if (!pathEqual(l, file) && fs.existsSync(l)) {
					resource = dep;
					break;
				}

			} else {
				for (let i = 0; i < exts.length; i++) {
					const
						ml = l + exts[i];

					if (!pathEqual(ml, file) && fs.existsSync(ml)) {
						resource = dep;
						break loop;
					}
				}
			}
		}

		if (resource) {
			if (isTS) {
				return `'${resource + url}'`;
			}

			return `'${path.join(resource, resolve.depMap[resource].config.sourceDir, url)}'`;
		}

		return str;
	});
};
