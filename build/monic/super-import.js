/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	$C = require('collection.js');

const
	fs = require('node:fs'),
	path = require('upath');

const
	isPathInside = require('is-path-inside'),
	{pathEqual} = require('path-equal');

const {
	resolve: {rootDependencies, depMap},
	config: {dependencies, super: superLink}
} = require('@pzlr/build-core');

const extensions = $C(include('build/webpack/resolve').extensions).to([]).reduce((list, ext) => {
	list.push(ext);
	list.push(`/index${ext}`);
	return list;
});

const
	importRgxp = new RegExp(`(['"])(${RegExp.escape(superLink)})(/.*?|(?=\\1))\\1`, 'g'),
	hasImport = importRgxp.removeFlags('g');

/**
 * A Monic replacer that enables the `@super` import alias within TS/JS files.
 * This alias always refers to the previous layer that has the specified file.
 *
 * @param {string} str
 * @param {string} filePath
 * @returns {string}
 *
 * @example
 * ```js
 * import '@super/foo';
 * ```
 */
module.exports = function superImportReplacer(str, filePath) {
	if (!dependencies.length || !hasImport.test(str)) {
		return str;
	}

	let
		start = 0;

	for (let i = 0; i < rootDependencies.length; i++) {
		if (isPathInside(fs.realpathSync(filePath), fs.realpathSync(rootDependencies[i]))) {
			start = i + 1;
			break;
		}
	}

	const
		isTS = path.extname(filePath) === '.ts';

	return str.replace(importRgxp, (str, $1, root, src) => {
		let
			resource;

		loop: for (let i = start; i < rootDependencies.length; i++) {
			const
				dep = dependencies[i],
				l = path.join(rootDependencies[i], src);

			if (path.extname(l)) {
				if (!pathEqual(l, filePath) && fs.existsSync(l)) {
					resource = dep;
					break;
				}

			} else {
				for (let i = 0; i < extensions.length; i++) {
					const
						ml = l + extensions[i];

					if (!pathEqual(ml, filePath) && fs.existsSync(ml)) {
						resource = dep;
						break loop;
					}
				}
			}
		}

		if (resource) {
			if (isTS) {
				return `'${resource + src}'`;
			}

			return `'${path.join(resource, depMap[resource].config.sourceDir, src)}'`;
		}

		return str;
	});
};

Object.assign(module.exports, {
	hasImport,
	importRgxp
});
