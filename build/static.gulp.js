'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	gulp = require('gulp'),
	plumber = require('gulp-plumber');

gulp.task('favicons', (cb) => {
	const
		favicons = require('gulp-favicons'),
		image = require('gulp-image'),
		async = require('async');

	/* eslint-disable camelcase */

	async.series([
		(cb) => gulp.src('./assets/logo.svg')
			.pipe(plumber())
			.pipe(favicons({
				appName: 'V4Fire',
				start_url: '.',
				background: '#3D7D73',
				path: '../../assets/favicons/',
				display: 'standalone',
				orientation: 'portrait',
				version: 1.0,
				logging: false,
				html: 'favicons.html',
				pipeHTML: true,
				replace: true
			}))

			.pipe(gulp.dest('./assets/favicons'))
			.on('end', cb),

		(cb) => gulp.src('./assets/favicons/*')
			.pipe(plumber())
			.pipe(image({
				pngquant: true,
				concurrent: 10
			}))

			.pipe(gulp.dest('./assets/favicons'))
			.on('end', cb)

	], cb);

	/* eslint-enable camelcase */
});

gulp.task('html', (cb) => {
	const
		htmlmin = require('gulp-htmlmin'),
		replace = require('gulp-replace');

	gulp.src('./dist/packages/**/*.html')
		.pipe(plumber())
		.pipe(htmlmin({
			useShortDoctype: true,
			conservativeCollapse: true,
			removeAttributeQuotes: true
		}))

		.pipe(gulp.dest('./dist/packages'))
		.on('end', cb);
});

gulp.task('css', (cb) => {
	const
		csso = require('gulp-csso'),
		async = require('async');

	function f(path, cb) {
		return gulp.src([`${path}/**/*.css`, `!${path}/**/*.min.css`])
			.pipe(plumber())
			.pipe(csso())
			.pipe(gulp.dest(path))
			.on('end', cb);
	}

	async.parallel([
		(cb) => f('./dist/packages/lib', cb),
		(cb) => f('./assets', cb),
	], cb);
});

gulp.task('js', (cb) => {
	const
		uglify = require('gulp-uglify'),
		async = require('async');

	/* eslint-disable camelcase */

	function f(path, cb) {
		return gulp.src([`${path}/**/*.js`, `!${path}/**/*.min.js`])
			.pipe(plumber())
			.pipe(uglify({
				compress: {
					warnings: false,
					keep_fnames: true
				},

				output: {
					comments: false
				},

				mangle: false
			}))

			.pipe(gulp.dest(path))
			.on('end', cb);
	}

	/* eslint-enable camelcase */

	async.parallel([
		(cb) => f('./dist/packages/lib', cb),
		(cb) => f('./assets', cb),
	], cb);
});

gulp.task('image', (cb) => {
	const
		image = require('gulp-image'),
		async = require('async');

	function f(path, cb) {
		const isArr = Array.isArray(path);
		return gulp.src([`${isArr ? path[0] : path}/**/*.@(png|svg)`].concat(isArr ? path[1] || [] : []))
			.pipe(plumber())
			.pipe(image({
				pngquant: true,
				svgo: true,
				concurrent: 10
			}))

			.pipe(gulp.dest(isArr ? path[0] : path))
			.on('end', cb);
	}

	async.parallel([
		(cb) => f('./dist/packages', cb),
		(cb) => f(['./assets', `!assets/favicons/**`], cb),
	], cb);
});

gulp.task('gzip', ['image', 'html', 'css', 'js'], (cb) => {
	const
		async = require('async'),
		gzip = require('gulp-gzip');

	function f(path, cb) {
		return gulp.src([`${path}/**/*`, `!${path}/**/*.gz`])
			.pipe(plumber())
			.pipe(gzip({
				threshold: '1kb',
				gzipOptions: {level: 9}
			}))

			.pipe(gulp.dest(path))
			.on('end', cb);
	}

	async.parallel([
		(cb) => f('./dist/packages', cb),
		(cb) => f('./assets', cb),
	], cb);
});
