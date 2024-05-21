/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	fs = require('node:fs'),
	glob = require('fast-glob'),
	path = require('upath');

const
	{src, i18n, locale, webpack} = require('@config/config');

module.exports = class I18NGeneratorPlugin {
	/**
	 * This WebPack plugin allows the integration of internationalization files
	 * from the file system into HTML applications
	 *
	 * @param {import('webpack').Compiler} compiler
	 */
	apply(compiler) {
		compiler.hooks.done.tap('I18NGeneratorPlugin', doneHook);

		function doneHook({compilation}) {
			// Should be executed only in the final build step,
			// ensuring all files are fully prepared and appropriately stored in the file system
			if (compilation.compiler?.name === 'html') {
				const
					configLocale = locale,
					locales = i18n.supportedLocales(),
					// Extract translates from DefinePlugin
					// translates declared in build/globals.webpack.js
					localizations = JSON.parse(compilation.valueCacheVersions.get('webpack/DefinePlugin LANG_KEYSETS'));

				const htmlFiles = () =>
					glob.sync(path.normalize(src.clientOutput('*.html')), {
						ignore: path.normalize(src.clientOutput(`*_(${locales.join('|')}).html`))
					})

						.map((el) => String(el.name ?? el));

				const varsDeclFiles = () =>
					glob.sync(path.normalize(src.clientOutput('*.vars-decl.js')))
						.map((el) => String(el.name ?? el));

				switch (i18n.strategy()) {
					case 'inlineMultipleHTML': {
						htmlFiles().forEach((file) => {
							i18n.supportedLocales().forEach((locale) => {
								fs.writeFileSync(
									file.replace('.html', `_${locale}.html`),
									webpack.externalizeInline() ?
										setLocalizedVarsDecl(file, locale) :
										inlineLangPacks(file, {[locale]: localizations[locale]})
								);
							});

							if (!webpack.externalizeInline()) {
								fs.writeFileSync(
									file,
									inlineLangPacks(file, {[configLocale]: localizations[configLocale]})
								);
							}
						});

						if (webpack.externalizeInline()) {
							varsDeclFiles().forEach((file) => {
								i18n.supportedLocales().forEach((locale) => {
									fs.writeFileSync(
										file.replace('.js', `_${locale}.js`),
										inlineLangPacks(file, {[locale]: localizations[locale]})
									);
								});

								fs.writeFileSync(
									file,
									inlineLangPacks(file, {[configLocale]: localizations[configLocale]})
								);
							});
						}

						break;
					}

					case 'inlineSingleHTML': {
						(webpack.externalizeInline() ? varsDeclFiles() : htmlFiles()).forEach((file) => fs.writeFileSync(
							file,
							inlineLangPacks(file, localizations)
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
		 * Reads the file from the given path,
		 * integrates the chosen internationalization pack into it, and then returns its content
		 *
		 * @param {string} path
		 * @param {object} langPacs
		 * @returns {string}
		 */
		function inlineLangPacks(path, langPacs) {
			return fs
				.readFileSync(path, {encoding: 'utf8'})
				.replace(new RegExp(`${i18n.langPacksStore}\\s*=\\s*{}`), `${i18n.langPacksStore}=${JSON.stringify(langPacs)}`);
		}

		/**
		 * Reads the file from the given path,
		 * changes the path of the vars declaration file within it, and then returns its content
		 *
		 * @param {string} path
		 * @param {string} locale
		 * @returns {string}
		 */
		function setLocalizedVarsDecl(path, locale) {
			return fs
				.readFileSync(path, {encoding: 'utf8'})
				.replace(/\.vars-decl\.js/, `.vars-decl_${locale}.js`);
		}
	}
};
