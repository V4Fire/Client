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
	{src, i18n, locale, webpack} = require('@config/config');

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
			if (compilation.compiler?.name === 'html') {
				const
					configLocale = locale,
					locales = i18n.supportedLocales(),
					localizations = collectI18NKeysets(locales);

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
									webpack.externalizeInitial() ?
										setLocalizedVarsDecl(file, locale) :
										inlineLangPacks(file, {[locale]: localizations[locale]})
								);
							});

							if (!webpack.externalizeInitial()) {
								fs.writeFileSync(
									file,
									inlineLangPacks(file, {[configLocale]: localizations[configLocale]})
								);
							}
						});

						if (webpack.externalizeInitial()) {
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
						(webpack.externalizeInitial() ? varsDeclFiles() : htmlFiles()).forEach((file) => fs.writeFileSync(
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
		 * Reads the file from the given path and inserts the specified internationalization pack into it
		 * and returns the new file content
		 *
		 * @param {string} path
		 * @param {object} langPacs
		 * @returns string
		 */
		function inlineLangPacks(path, langPacs) {
			return fs
				.readFileSync(path, {encoding: 'utf8'})
				.replace(new RegExp(`${i18n.langPacksStore}\\s*=\\s*{}`), `${i18n.langPacksStore}=${JSON.stringify(langPacs)}`);
		}

		function setLocalizedVarsDecl(path, locale) {
			return fs
				.readFileSync(path, {encoding: 'utf8'})
				.replace(/\.vars-decl\.js/, `.vars-decl_${locale}.js`);
		}
	}
};
