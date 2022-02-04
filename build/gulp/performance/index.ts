/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Gulp } from 'gulp';

import gulpLoadPlugs from 'gulp-load-plugins';
import yargs from 'yargs';

import { Validator } from 'build/gulp/performance/validator';
import { Metrics } from 'build/gulp/performance/metrics';
import { Project } from 'build/gulp/performance/project';
import { Logger } from 'build/gulp/performance/logger';

module.exports = function init(gulp: Gulp = require('gulp')) {
	const
		$ = gulpLoadPlugs({scope: ['optionalDependencies']});

	/**
	 * Запускает перф тесты всех компонентов
	 *
	 * `build` - Указывает на необходимость сборки при запуске теста (по умолчанию `true`)
	 * `metrics` - Метрики которые будут отслеживаться (по умолчанию все)
	 * `headless` - Если `true` то браузер будет запущен не в `headless` режиме
	 */
	gulp.task('test:performance', async () => {
		const args = yargs
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
				default: Metrics.availableMetrics,
				type: 'string',
				description: 'Metrics that will be observed during the test'
			})

			.argv;

		const
			{metrics} = args;

		Validator.validateParams({metrics}, true);
		Logger.logPackagesVersion();

		if (args.build) {
			await Project.build();
		}
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
		const args = yargs
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
			})

			.argv;
	});

	/**
	 * Если передан `entry` - запускает данный тест и сохраняет его снэпшот,
	 * если `entry` не передан - запускает все perf тест и сохраняет их снэпшоты.
	 *
	 * `entry` - точка входа для теста
	 */
	gulp.task('test:performance:snapshot', () => {
		const args = yargs
			.option('test-entry', {
				required: true,
				type: 'string',
				description: 'Path or glob pattern for test file'
			})

			.argv;
	});
};

