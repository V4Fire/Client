/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	{collectI18NKeysets} = include('build/helpers'),
	{src, i18n, locale} = require('@config/config');

const
	fs = require('fs'),
	glob = require('fast-glob'),
	path = require('upath');

/**
 * WebPack plugin for including internationalization files from the file system in HTML applications
 */
module.exports = class I18NGeneratorPlugin {
	/**
	 * @param {import('webpack').Compiler} compiler
	 */
	apply(compiler) {
		compiler.hooks.done.tap('I18NGeneratorPlugin', doneHook);

		function doneHook({compilation}) {
			// Should only run on the last build step when all files are ready and placed in the file system
			if (compilation.compiler && compilation.compiler.name === 'html') {
				const
					configLocale = locale,
					locales = i18n.supportedLocales(),
					localizations = collectI18NKeysets(locales);

				const htmlFiles = () =>
					glob.sync(path.normalize(src.clientOutput('*.html')), {
						ignore: path.normalize(src.clientOutput(`*_(${locales.join('|')}).html`))
					})

						.map((el) => String(el.name ?? el));

				switch (i18n.strategy()) {
					case 'inlineMultipleHTML': {
						htmlFiles().forEach((file) => {
							i18n.supportedLocales().forEach((locale) => {
								fs.writeFileSync(
									file.replace('.html', `_${locale}.html`),
									getHTMLWithLangPacs(file, {[locale]: localizations[locale]})
								);
							});

							fs.writeFileSync(
								file,
								getHTMLWithLangPacs(file, {[configLocale]: localizations[configLocale]})
							);
						});

						break;
					}

					case 'inlineSingleHTML': {
						htmlFiles().forEach((file) => fs.writeFileSync(
							file,
							getHTMLWithLangPacs(file, localizations)
						));

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
			}
		}

		/**
		 * Reads an HTML file from the given path and inserts the specified internationalization pack into it
		 * and returns the result HTML
		 *
		 * @param {string} path
		 * @param {object} langPacs
		 * @returns string
		 */
		function getHTMLWithLangPacs(path, langPacs) {
			return fs
				.readFileSync(path, {encoding: 'utf8'})
				.replace(new RegExp(`${i18n.langPacksStore}\\s*=\\s*{}`), `${i18n.langPacksStore}=${JSON.stringify(langPacs)}`);
		}
	}
};
