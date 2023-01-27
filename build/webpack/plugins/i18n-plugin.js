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
	fs = require('fs'),
	fg = require('fast-glob');

/**
 * Webpack plugin to ignore invalid warnings during building
 */
module.exports = class I18NGeneratorPlugin {
	apply(compiler) {
		compiler.hooks.done.tap('I18NGeneratorPlugin', doneHook);

		function doneHook(stats) {
			const paths = pzlr.sourceDirs.map((el) => `${el}/**/*.i18n/*.js`);
			const result = {};

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
				fs.writeFileSync(`${pzlr.cwd}/dist/client/${lang}.json`, JSON.stringify(value, undefined, 2));
			});

			debugger;
			// dist find globa('*.html')
			// do while ru, en, pr
			// copy => p_index_ru.html => find id='asdfads' => paste => json
		}
	}
};
