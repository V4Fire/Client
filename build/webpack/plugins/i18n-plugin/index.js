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
	{src, i18n, locale} = require('@config/config');

const
	fs = require('fs'),
	fg = require('fast-glob');

/**
 * WebPack plugin for including internationalization files from the file system in HTML applications
 */
module.exports = class I18NGeneratorPlugin {
	apply(compiler) {
		compiler.hooks.done.tap('I18NGeneratorPlugin', doneHook);

		function doneHook({compilation}) {
			// Should only run on the last build step when all files are ready and placed in the file system
			if (compilation.compiler && compilation.compiler.name === 'html') {
				const
					configLocale = locale,
					locales = i18n.supportedLocales().join('|');

				const
					paths = pzlr.sourceDirs.map((el) => `${el}/**/i18n/(${locales}).js`),
					localizations = {};

				fg.sync(paths).forEach((path) => {
					const
						parsedPath = /\/[^/]*?\/i18n\/(.*?)\.js$/i.exec(path);

						if (parsedPath != null) {
							const
								lang = parsedPath[1],
								localization = require(path);

							localizations[lang] ??= {};
							Object.keys(localization).forEach((keysetName) => {
								localizations[lang][keysetName] = {
									...localizations[lang][keysetName],
									...localization[keysetName]
								};
							});
						}
				});

				fg.sync(`${src.clientOutput()}/*.html`, {ignore: `${src.clientOutput()}/*_(${locales}).html`}).forEach((path) => {
					switch (i18n.strategy()) {
						case 'inlineMultipleHTML': {
							i18n.supportedLocales().forEach((locale) => {
								fs.writeFileSync(
									path.replace('.html', `_${locale}.html`),
									getHTMLWithLangPacs(path, {[locale]: localizations[locale]})
								);
							});

							fs.writeFileSync(
								path,
								getHTMLWithLangPacs(path, {[configLocale]: localizations[configLocale]})
							);

							break;
						}

						case 'inlineSingleHTML': {
							fs.writeFileSync(
								path,
								getHTMLWithLangPacs(path, localizations)
							);

							break;
						}

						case 'externalMultipleJSON': {
							Object.entries(localizations).forEach(([lang, value]) => {
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
		 * Reads an HTML file from the given path and inserts the specified internationalization pack into it
		 * and returns the result HTML
		 *
		 * @param {string} path
		 * @param {!Object} langPacs
		 * @returns string
		 */
		function getHTMLWithLangPacs(path, langPacs) {
			return fs
				.readFileSync(path, {encoding: 'utf8'})
				.replace(`${i18n.langPacksStore} = {}`, `${i18n.langPacksStore} = ${JSON.stringify(langPacs)}`);
		}
	}
};
