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
	fg = require('fast-glob');

/**
 * Webpack plugin to ignore invalid warnings during building
 */
module.exports = class I18NGeneratorPlugin {
	apply(compiler) {
		compiler.hooks.done.tap('I18NGeneratorPlugin', doneHook);

		function doneHook(stats) {
			console.log(pzlr.sourceDirs);
			const paths = pzlr.sourceDirs.map((el) => `${el}/**/*.i18n/*.js`);
			const res = fg.sync(paths);
			debugger;
			// pzlr for all layers
			// fg => list of files
			// require('') || fs.readFile('path') || JSON.parse();
			// result = {}
			// json.stringify(result) => fs.writeFile(dist/ru.json);
			// dist find globa('*.html')
			// do while ru, en, pr
			// copy => p_index_ru.html => find id='asdfads' => paste => json
		}
	}
};
