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
		path = require('path'),
		config = require('config');

	const
		merge = require('merge2'),
		$ = require('gulp-load-plugins')({scope: ['optionalDependencies']});

	function a(file = '') {
		return path.join(config.src.assets(), file);
	}

	function o(file = '') {
		return path.join(config.src.clientOutput(), file);
	}

	gulp.task('static:favicons', () => {
		/* eslint-disable camelcase */

		const faviconsParams = Object.assign(config.favicons(), {
			start_url: '.',
			html: 'favicons.html',
			pipeHTML: true,
			replace: true
		});

		/* eslint-enable camelcase */

		return merge([
			gulp.src(a('logo.svg'))
				.pipe($.plumber())
				.pipe($.favicons(faviconsParams))
				.pipe(gulp.dest(a('favicons'))),

			gulp.src(a('favicons/*'))
				.pipe($.plumber())
				.pipe($.image({
					pngquant: true,
					concurrent: 10
				}))

				.pipe(gulp.dest(a('favicons')))
		]);
	});

	gulp.task('static:html', () =>
		gulp.src(o('/**/*.html'))
			.pipe($.plumber())
			.pipe($.htmlmin(config.html()))
			.pipe(gulp.dest(o()))
	);

	gulp.task('static:css', () => {
		function f(src) {
			return gulp.src([path.join(src, '/**/*.css'), `!${path.join(src, '/**/*.min.css')}`])
				.pipe($.plumber())
				.pipe($.csso())
				.pipe(gulp.dest(src));
		}

		return merge([
			f(o('lib'), cb),
			f(a(), cb)
		]);
	});

	gulp.task('static:js', () => {
		/* eslint-disable camelcase */

		function f(src) {
			return gulp.src([path.join(src, '/**/*.js'), `!${path.join(src, '/**/*.min.js')}`])
				.pipe($.plumber())
				.pipe($.uglify({
					compress: {
						warnings: false,
						keep_fnames: true
					},

					output: {
						comments: false
					},

					mangle: false
				}))

				.pipe(gulp.dest(src));
		}

		return merge([
			f(o('lib')),
			f(a()),
		]);
	});

	gulp.task('static:image', () => {
		function f(src) {
			const isArr = Array.isArray(src);
			return gulp.src([path.join(isArr ? src[0] : src, '/**/*.@(png|svg)')].concat(isArr ? src[1] || [] : []))
				.pipe($.plumber())
				.pipe($.image({
					pngquant: true,
					svgo: true,
					concurrent: 10
				}))

				.pipe(gulp.dest(isArr ? src[0] : src));
		}

		return merge([
			f(o()),
			f([a(), `!${path.join(a(), 'favicons/**')}`]),
		]);
	});

	gulp.task('static:gzip', gulp.series([gulp.parallel(['static:image', 'static:html', 'static:css', 'static:js']), () => {
		function f(src) {
			return gulp.src([path.join(src, '/**/*'), `!${path.join(src, '/**/*.gz')}`])
				.pipe($.plumber())
				.pipe($.gzip({
					threshold: '1kb',
					gzipOptions: {level: 9}
				}))

				.pipe(gulp.dest(src));
		}

		return merge([
			f(o()),
			f(a()),
		]);
	}]));

	gulp.task('static', gulp.series(['static:gzip']));
};
