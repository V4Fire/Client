// @ts-check

/// <reference path="../../../ts-definitions/perf.d.ts" />

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

	const
		helpers = require('./helpers');

	/**
	 * Запускает перф тесты всех компонентов
	 *
	 * `build` - указывает на необходимость сборки при запуске теста (по умолчанию `true`)
	 * `metrics` - метрики которые будут отслеживаться (по умолчанию все)
	 * `headless` - если `true` то браузер будет запущен не в `headless` режиме
	 */
	gulp.task('test:performance', () => {
		const
			yargs = require('yargs');

		yargs
			.option('build', {
				default: true,
				required: false,
				type: 'boolean',
				description: 'If true, then the project will be builded before run the test'
			})

			.option('headless', {
				default: false,
				required: false,
				type: 'boolean',
				description: 'If true, then the browser will be run not in headless mode'
			})

			.option('metrics', {
				required: false,
				isArray: true,
				type: 'string',
				description: 'Metrics that will be observed during the test'
			});

		if ()
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
		const
			yargs = require('yargs');

		yargs
			.option('test-entry', {
				required: true,
				type: 'string',
				description: 'Test path or glob pattern'
			})

			.option('build', {
				required: false,
				type: 'boolean',
				description: 'If true, then the project will be builded before run the test'
			})

			.option('headless', {
				required: false,
				type: 'boolean',
				description: 'If true, then the browser will be run not in headless mode'
			})

			.option('metrics', {
				required: false,
				isArray: true,
				type: 'string',
				description: 'Metrics that will be observed during the test'
			});
	});

	/**
	 * Если передан `entry` - запускает данный тест и сохраняет его снэпшот,
	 * если `entry` не передан - запускает все perf тест и сохраняет их снэпшоты.
	 *
	 * `entry` - точка входа для теста
	 */
	gulp.task('test:performance:snapshot', () => {
		const
			yargs = require('yargs');

		yargs
			.option('test-entry', {
				required: true,
				type: 'string',
				description: 'Test path or glob pattern'
			});
	});
};

