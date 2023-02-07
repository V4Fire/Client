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
	{src, supportedLocales} = require('@config/config'),
	fs = require('fs'),
	fg = require('fast-glob');

/**
 * Webpack plugin to collect all translates on filesystem
 * and include them to html
 */
module.exports = class I18NGeneratorPlugin {
	apply(compiler) {
		compiler.hooks.done.tap('I18NGeneratorPlugin', doneHook);

		function doneHook(compilation) {
			/**
			 * Should run only at the last stage of the build
			 * when all the files are ready and placed on the file system
			 */
			if (true) {
				const
					locales = supportedLocales().join('|'),
					paths = pzlr.sourceDirs.map((el) => `${el}/**/*.i18n/(${locales}).js`),
					result = {};

				fg.sync(paths).forEach((path) => {
					const
						element = require(path),
						parsedPath = /\/[^/]*?\.i18n\/(.*?)\.js$/i.exec(path);

						if (parsedPath != null) {
							const
								lang = parsedPath[1];

							result[lang] = result[lang] ?? {};

							Object.keys(element).forEach((keysetName) => {
								result[lang][keysetName] = {
									...result[lang][keysetName] != null ? result[lang][keysetName] : {},
									...element[keysetName]
								};
							});
						}
				});

				Object.entries(result).forEach(([lang, value]) => {
					fs.writeFileSync(`${src.clientOutput()}/${lang}.json`, JSON.stringify(value, undefined, 2));
				});

				fg.sync(`${src.clientOutput()}/*.html`, {ignore: `${src.clientOutput()}/*_(${locales}).html`}).forEach((path) => {
					supportedLocales().forEach((locale) => {
						const
							newFile = fs.readFileSync(path, {encoding: 'utf8'}).replace('TRANSLATE_MAP = {}', `TRANSLATE_MAP = ${JSON.stringify(result[locale])}`);

						fs.writeFileSync(path.replace('.html', `_${locale}.html`), newFile);
					});
				});
			}
		}
	}
};
