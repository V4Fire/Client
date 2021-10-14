'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	config = require('config');

const
	{src, build} = config,
	{block} = require('@pzlr/build-core');

/**
 * @override
 *
 * @example
 * ```bash
 * # Builds a `components-lock` file
 * npx gulp build:components-lock
 *
 * # Builds the application as a node.js package
 * npx gulp build:server
 *
 * # Builds the project as a client (browser) package
 * npx gulp build:client
 *
 * # Builds the application as a node.js package and watches for changes
 * npx gulp watch:server
 *
 * # Builds the project as a client (browser) package and watches for changes
 * npx gulp watch:client
 *
 * # Cleans the dist directory of a node.js package
 * npx gulp clean:server
 *
 * # Cleans the dist directory of a client (browser) package
 * npx gulp clean:client
 * ```
 */
module.exports = function init(gulp = require('gulp')) {
	include('@super/build/build.gulp', __dirname)(gulp);

	const
		$ = require('gulp-load-plugins')({scope: ['optionalDependencies']});

	const
		args = process.argv.slice(3).join(' ');

	/**
	 * Cleans the dist directory of a client (browser) package
	 */
	gulp.task('clean:client', () => require('del')(src.clientOutput()));

	/**
	 * Builds the project as a client (browser) package
	 */
	gulp.task('build:client', () => {
		const t = $.run(`npx webpack ${args}`, {verbosity: 3}).exec();
		return t.on('error', console.error);
	});

	/**
	 * Builds a `components-lock` file
	 */
	gulp.task('build:components-lock', async () => {
		block.setObjToHash(config.componentDependencies());

		await block.getAll(null, {
			lockPrefix: build.componentLockPrefix()
		});
	});

	/**
	 * Builds the project as a client (browser) package and watches for changes
	 */
	gulp.task('watch:client', () => {
		const t = $.run(`npx webpack --watch ${args}`, {verbosity: 3}).exec();
		return t.on('error', console.error);
	});
};
