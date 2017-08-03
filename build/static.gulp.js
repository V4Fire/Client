'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

module.exports = function (gulp = require('gulp')) {
	const
		path = require('config'),
		config = require('config'),
		async = require('async'),
		plumber = require('gulp-plumber');

	function a(file = '') {
		return path.join(config.src.assets(), file);
	}

	function o(file = '') {
		return path.join(config.src.clientOutput(), file);
	}

	gulp.task('favicons', (cb) => {
		const
			favicons = require('gulp-favicons'),
			image = require('gulp-image');

		/* eslint-disable camelcase */

		const faviconsParams = Object.assign({}, config.favicons, {
			start_url: '.',
			html: 'favicons.html',
			pipeHTML: true,
			replace: true
		});

		/* eslint-enable camelcase */

		async.series([
			(cb) => gulp.src(a('logo.svg'))
				.pipe(plumber())
				.pipe(favicons(faviconsParams))
				.pipe(gulp.dest(a('favicons')))
				.on('end', cb),

			(cb) => gulp.src(a('favicons/*'))
				.pipe(plumber())
				.pipe(image({
					pngquant: true,
					concurrent: 10
				}))

				.pipe(gulp.dest(a('favicons')))
				.on('end', cb)

		], cb);
	});

	gulp.task('html', (cb) => {
		const
			htmlmin = require('gulp-htmlmin');

		gulp.src(o('/**/*.html'))
			.pipe(plumber())
			.pipe(htmlmin({
				useShortDoctype: true,
				conservativeCollapse: true,
				removeAttributeQuotes: true
			}))

			.pipe(gulp.dest(o()))
			.on('end', cb);
	});

	gulp.task('css', (cb) => {
		const
			csso = require('gulp-csso'),
			async = require('async');

		function f(src, cb) {
			return gulp.src([path.join(src, '/**/*.css'), `!${path.join(src, '/**/*.min.css')}`])
				.pipe(plumber())
				.pipe(csso())
				.pipe(gulp.dest(src))
				.on('end', cb);
		}

		async.parallel([
			(cb) => f(o('lib'), cb),
			(cb) => f(a(), cb),
		], cb);
	});

	gulp.task('js', (cb) => {
		const
			uglify = require('gulp-uglify');

		/* eslint-disable camelcase */

		function f(src, cb) {
			return gulp.src([path.join(src, '/**/*.js'), `!${path.join(src, '/**/*.min.js')}`])
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

				.pipe(gulp.dest(src))
				.on('end', cb);
		}

		/* eslint-enable camelcase */

		async.parallel([
			(cb) => f(o('lib'), cb),
			(cb) => f(a(), cb),
		], cb);
	});

	gulp.task('image', (cb) => {
		const
			image = require('gulp-image');

		function f(src, cb) {
			const isArr = Array.isArray(src);
			return gulp.src([path.join(isArr ? src[0] : src, '/**/*.@(png|svg)')].concat(isArr ? src[1] || [] : []))
				.pipe(plumber())
				.pipe(image({
					pngquant: true,
					svgo: true,
					concurrent: 10
				}))

				.pipe(gulp.dest(isArr ? src[0] : src))
				.on('end', cb);
		}

		async.parallel([
			(cb) => f(o(), cb),
			(cb) => f([a(), `!${path.join(a(), 'favicons/**')}`], cb),
		], cb);
	});

	gulp.task('gzip', ['image', 'html', 'css', 'js'], (cb) => {
		const
			gzip = require('gulp-gzip');

		function f(src, cb) {
			return gulp.src([path.join(src, '/**/*'), `!${path.join(src, '/**/*.gz')}`])
				.pipe(plumber())
				.pipe(gzip({
					threshold: '1kb',
					gzipOptions: {level: 9}
				}))

				.pipe(gulp.dest(src))
				.on('end', cb);
		}

		async.parallel([
			(cb) => f(o(), cb),
			(cb) => f(a(), cb),
		], cb);
	});
};
