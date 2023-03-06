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
	{src, i18n, locale} = require('@config/config'),
	fs = require('fs'),
	fg = require('fast-glob');

/**
 * Webpack plugin to collect all translates on filesystem
 * and include them to html-s
 * Clones an html document for each language
 */
module.exports = class I18NGeneratorPlugin {
	apply(compiler) {
		compiler.hooks.done.tap('I18NGeneratorPlugin', doneHook);

		function doneHook({compilation}) {
			/**
			 * Should run only at the last stage of the build
			 * when all the files are ready and placed on the file system
			 */
			if (compilation.compiler && compilation.compiler.name === 'html') {
				const
					configLocale = locale,
					locales = i18n.supportedLocales().join('|'),
					paths = pzlr.sourceDirs.map((el) => `${el}/**/i18n/(${locales}).js`),
					result = {};

				fg.sync(paths).forEach((path) => {
					const
						element = require(path),
						parsedPath = /\/[^/]*?\/i18n\/(.*?)\.js$/i.exec(path);

						if (parsedPath != null) {
							const
								lang = parsedPath[1];

							result[lang] = result[lang] ?? {};

							Object.keys(element).forEach((keysetName) => {
								result[lang][keysetName] = {
									...result[lang][keysetName],
									...element[keysetName]
								};
							});
						}
				});

				fg.sync(`${src.clientOutput()}/*.html`, {ignore: `${src.clientOutput()}/*_(${locales}).html`}).forEach((path) => {
					switch (i18n.i18nEngine) {
						case 'inlineMultipleHTML': {
							i18n.supportedLocales().forEach((locale) => {
								fs.writeFileSync(
									path.replace('.html', `_${locale}.html`),
									getHtmlWithTranslateMap(path, {[locale]: result[locale]})
								);
							});

							fs.writeFileSync(
								path,
								getHtmlWithTranslateMap(path, {[configLocale]: result[configLocale]})
							);

							break;
						}

						case 'inlineSingleHTML': {
							fs.writeFileSync(
								path,
								getHtmlWithTranslateMap(path, result)
							);

							break;
						}

						case 'externalJSON': {
							Object.entries(result).forEach(([lang, value]) => {
								fs.writeFileSync(`${src.clientOutput()}/${lang}.json`, JSON.stringify(value, undefined, 2));
							});

							break;
						}

						default:
							// Do nothing
					}
				});
			}
		}

		/**
		 * The function allows you to get an html document with translations embedded inside
		 *
		 * @param {string} path - path to html file
		 * @param {Object} translateMap - Dictionary with translations to be inserted into html
		 * @returns string
		 */
		function getHtmlWithTranslateMap(path, translateMap) {
			return fs
				.readFileSync(path, {encoding: 'utf8'})
				.replace(`${i18n.translatesGlobalPath} = {}`, `${i18n.translatesGlobalPath} = ${JSON.stringify(translateMap)}`);
		}
	}
};
