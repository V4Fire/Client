'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{resolve: pzlr} = require('@pzlr/build-core'),
	path = require('upath');

/**
 * Finds all files with translations and sticks them together into one object
 *
 * @param {!Array<string>} locales - List of languages for collect
 * @returns {!Object}
 */
function collectI18NKeysets(locales) {
	const
		i18nFiles = pzlr.sourceDirs.map((el) => path.join(el, `/**/i18n/(${locales.join('|')}).js`)),
		localizations = {};

	glob.sync(i18nFiles).forEach((filePath) => {
		const
			p = /\/[^/]*?\/i18n\/(?<lang>.*?)\.js$/.exec(path.normalize(filePath))?.groups;

		if (p == null) {
			return;
		}

		const localization = require(filePath);
		localizations[p.lang] ??= {};

		Object.keys(localization).forEach((keysetName) => {
			localizations[p.lang][keysetName] = {
				...localizations[p.lang][keysetName],
				...localization[keysetName]
			};
		});
	});

	return localizations;
}

exports.collectI18NKeysets = collectI18NKeysets;
