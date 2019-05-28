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
	Snakeskin = require('snakeskin'),
	Typograf = require('typograf');

const
	escaper = require('escaper'),
	config = require('config');

const
	fs = require('fs'),
	path = require('upath'),
	glob = require('glob'),
	isPathInside = require('is-path-inside');

const
	{validators, resolve, config: {dependencies, superRgxp}} = require('@pzlr/build-core'),
	tp = new Typograf(config.typograf());

const
	resources = [resolve.blockSync(), ...resolve.dependencies],
	resourcesRgxp = $C(dependencies).map((el) => new RegExp(`^${RegExp.escape(el)}`));

const
	tagRgxp = /<[^>]+>/,
	tagNonceRgxp = /^(['"])<(link|script)([^>]*)>/;

const
	elRgxp = new RegExp(`\\b${validators.baseBlockName}__[a-z0-9][a-z0-9-_]*\\b`),
	ssExtRgxp = /\.e?ss$/;

Snakeskin.importFilters({
	/**
	 * Adds a runtime nonce attribute if GLOBAL_NONCE was defined
	 *
	 * @param {string} tag
	 * @returns {string}
	 */
	addNonce(tag) {
		if (tagNonceRgxp.test(tag)) {
			return tag.replace(tagNonceRgxp, `$1<$2$3$1 + (typeof GLOBAL_NONCE === 'string' ? ' nonce="' + GLOBAL_NONCE + '"' : '') + $1>`);
		}

		return tag;
	},

	/**
	 * Applies Typograf to the specified string and returns it
	 *
	 * @param {string} str
	 * @returns {string}
	 */
	typograf(str) {
		return tp.execute(str);
	},

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
	 * @param {string} source
	 * @returns {(string|string[])}
	 */
	b(url, source) {
		let
			start = 0;

		if (superRgxp.test(url)) {
			url = url.replace(superRgxp, '');

			for (let i = 0; i < resources.length; i++) {
				if (isPathInside(source, resources[i])) {
					start = i + 1;
					break;
				}
			}

		} else {
			for (let i = 0; i < resourcesRgxp.length; i++) {
				const
					rgxp = resourcesRgxp[i];

				if (rgxp.test(url)) {
					url = url.replace(rgxp, '');
					start = i + 1;
					break;
				}
			}
		}

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

		for (let i = start; i < resources.length; i++) {
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

Snakeskin.setFilterParams('b', {
	bind: [(o) => JSON.stringify(o.environment.filename)]
});

Snakeskin.setFilterParams('addNonce', {
	'!html': true
});
