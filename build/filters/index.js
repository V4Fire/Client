'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	Snakeskin = require('snakeskin'),
	escaper = require('escaper');

const
	fs = require('fs'),
	path = require('upath'),
	glob = require('glob');

const
	{validators, resolve} = require('@pzlr/build-core'),
	resources = [resolve.blockSync(), ...resolve.dependencies];

const
	tagRgxp = /<[^>]+>/,
	elRgxp = new RegExp(`\\b${validators.baseBlockName}__[a-z0-9][a-z0-9-_]*\\b`),
	ssExtRgxp = /\.e?ss$/;

Snakeskin.importFilters({
	/**
	 * Returns a first element name
	 *
	 * @param {string} decl
	 * @returns {?string}
	 */
	getFirstTagElementName(decl) {
		const
			escapedStr = escaper.replace(decl),
			tagMatch = tagRgxp.exec(escapedStr);

		if (!tagMatch) {
			return null;
		}

		const search = elRgxp.exec(escaper.paste(tagMatch[0]));
		return search ? search[0] : null;
	},

	/**
	 * Include filter
	 *
	 * @param {string} url
	 * @returns {(string|!Array<string>)}
	 */
	b(url) {
		const
			hasMagic = glob.hasMagic(url),
			end = ssExtRgxp.test(url) ? '' : '/',
			ends = [];

		if (end) {
			const
				basename = path.basename(url);

			if (!glob.hasMagic(basename)) {
				ends.push(`${basename}.ss`);
			}

			if (!validators.blockName(basename)) {
				ends.push('main.ss', 'index.ss');
			}

		} else {
			ends.push('');
		}

		const
			paths = [];

		for (let i = 0; i < resources.length; i++) {
			for (let j = 0; j < ends.length; j++) {
				const
					fullPath = path.join(resources[i], url, ends[j] || '');

				if (hasMagic) {
					paths.push(...glob.sync(fullPath));

				} else if (fs.existsSync(fullPath)) {
					return fullPath;
				}
			}
		}

		if (hasMagic) {
			return paths;
		}

		return url + end;
	}
});
