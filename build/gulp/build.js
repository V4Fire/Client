'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	config = require('config'),
	through2 = require('through2'),
	Vinyl = require('vinyl');

const
	{src, build} = config,
	{mergeStats, createUnifiedJSONStats} = include('build/helpers/webpack'),
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
 *
 * # Merge multiple Webpack compilations from a stat file into one
 * npx gulp stats:merge
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

	/**
	 * Purify a Webpack stats file from unnecessary content
	 */
	gulp.task('stats:purify', () => {
		const statoscopeConfig = config.statoscope();

		const cutContentBeforeBracket = (content) => content.replace(/^[^{]*/, '');
		const cutContentAfterBracket = (content) => content.replace(/}[^}]*$/, '}');
		const selectOnlyBracketsContent = (content) => cutContentAfterBracket(cutContentBeforeBracket(content));

		return gulp
			.src(statoscopeConfig.statsPath)
			.pipe($.plumber())
			.pipe(through2.obj(processStatsFile))
			.pipe(gulp.dest('./'));

		function processStatsFile(file, _, cb) {
			const content = selectOnlyBracketsContent(file.contents.toString());

			this.push(
				new Vinyl({
					path: statoscopeConfig.mergedStatsPath,
					contents: Buffer.from(content)
				})
			);

			cb();
		}
});

	/**
	 * Merge multiple Webpack compilations from a stat file into one
	 */
	 gulp.task('stats:merge', () => {
			const statoscopeConfig = config.statoscope();

			return gulp
				.src(statoscopeConfig.statsPath)
				.pipe($.plumber())
				.pipe(through2.obj(processStatsFile))
				.pipe(gulp.dest('./'));

			function processStatsFile(file, _, cb) {
				const stats = JSON.parse(file.contents.toString());

				this.push(
					new Vinyl({
						path: statoscopeConfig.mergedStatsPath,
						contents: Buffer.from(JSON.stringify(mergeStats(stats)))
					})
				);

				cb();
			}
		});

	/**
	 * Patches Webpack stats files
	 */
	gulp.task('stats:patch', () => {
		const statoscopeConfig = config.statoscope();
		let statsA;

		return gulp
			.src([statoscopeConfig.statsPath, statoscopeConfig.patchStatsPath])
			.pipe($.plumber())
			.pipe(through2.obj(processStatsFile))
			.pipe(gulp.dest('./'));

		function processStatsFile(file, _, cb) {
			const stats = JSON.parse(file.contents.toString());

			if (!statsA) {
				statsA = stats;
				cb();

				return;
			}

			this.push(
				new Vinyl({
					path: statoscopeConfig.patchStatsPath,
					contents: Buffer.from(createUnifiedJSONStats(statsA, stats))
				})
			);

			cb();
		}
	});
};
