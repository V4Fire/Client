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
	cache = Object.create(null),
	exists = Object.create(null);

/**
 * Monic replacer for Stylus @import declarations
 *
 * @param {Array<string>} folders - list of related folders
 * @param {string} lib - path to a node_modules folder
 * @returns {function(string, string): string}
 */
module.exports = function ({folders, lib}) {
	folders = folders.slice().reverse();

	return (str, file) => {
		const
			cwd = path.dirname(file),
			parent = path.dirname(cwd),
			c = cache[parent] = cache[parent] || {};

		if (c[str]) {
			return c[str];
		}

		function r(str) {
			return str.replace(/\\/g, '/');
		}

		return c[str] = str
			.replace(/@import "([^./~].*?\.styl)"/g, (str, url) => {
				for (let i = 0; i < folders.length; i++) {
					const
						fullPath = path.join(folders[i], url);

					if (fullPath in exists === false) {
						exists[fullPath] = fs.existsSync(fullPath);
					}

					if (exists[fullPath]) {
						return `@import "./${r(path.relative(cwd, fullPath))}"`;
					}
				}

				return `@import "${url}"`;
			})

			.replace(/@import "~(.*?\.styl)"/g, (str, url) => {
				url = r(path.relative(cwd, path.join(lib, url)));
				return `@import "${url}"`;
			});
	};
};
