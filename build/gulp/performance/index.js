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
	 * Запускает перф тесты всех компонентов
	 *
	 * `build` - указывает на необходимость сборки при запуске теста (по умолчанию `true`)
	 * `metrics` - метрики которые будут отслеживаться (по умолчанию все)
	 * `headless` - если `true` то браузер будет запущен не в `headless` режиме
	 */
	gulp.task('test:performance', () => {
		// ...
	});

	/**
	 * Запускает перф тест переданного компонента
	 *
	 * `build` - указывает на необходимость сборки при запуске теста (по умолчанию `true`)
	 * `entry` - точка входа для теста
	 * `metrics` - метрики которые будут отслеживаться (по умолчанию все)
	 * `headless` - если `true` то браузер будет запущен не в `headless` режиме
	 */
	gulp.task('test:performance:run', () => {
		// ...
	});

	/**
	 * Если передан `entry` - запускает данный тест и сохраняет его снэпшот,
	 * если `entry` не передан - запускает все perf тест и сохраняет их снэпшоты.
	 *
	 * `entry` - точка входа для теста
	 */
	gulp.task('test:performance:snapshot', () => {
		// ...
	});
};

