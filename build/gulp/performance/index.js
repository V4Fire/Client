// @ts-check

'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

module.exports = function init(gulp = require('gulp')) {
	const
		$ = require('gulp-load-plugins')({scope: ['optionalDependencies']});

	/**
	 * `build` - указывает на необходимость сборки при запуске теста (по умолчанию `true`)
	 * `entry` - точка входа для теста
	 * `metrics` - метрики которые будут отслеживаться (по умолчанию все)
	 */
	gulp.task('test:performance', () => {
		// ...
	});

	/**
	 * Запускается со всеми метриками
	 *
	 * `snapshot` - запускает тест и снимает снэпшот устанавливая его как "эталонный"
	 * `build` - указывает на необходимость сборки при запуске теста (по умолчанию `true`)
	 * `entry` - точка входа для теста
	 */
	gulp.task('test:performance:snapshot', () => {
		// ...
	});
};

