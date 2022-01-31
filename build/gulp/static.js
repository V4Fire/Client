/* eslint-disable camelcase */

'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	path = require('upath'),
	config = require('@config/config');

/**
 * Registers gulp tasks to minify/generate project static assets
 *
 * @example
 * ```bash
 * # Builds project favicons
 * npx gulp static:favicons
 *
 * # Minifies project HTML files
 * npx gulp static:html
 *
 * # Minifies project CSS files
 * npx gulp static:css
 *
 * # Minifies project JS files
 * npx gulp static:js
 *
 * # Minifies project images
 * npx gulp static:image
 *
 * # Generates WEBP from project images
 * npx gulp static:image:webp
 *
 * # Generates GZ archives from project files
 * npx gulp static:gzip
 * ```
 */
module.exports = function init(gulp = require('gulp')) {
	const
		merge = require('merge2'),
		$ = require('gulp-load-plugins')({scope: ['optionalDependencies']});

	function a(file = '') {
		return path.join(config.src.assets(), file);
	}

	function o(file = '') {
		return path.join(config.src.clientOutput(), file);
	}

	/**
	 * Builds project favicons
	 */
	gulp.task('static:favicons:build', () => {
		const faviconsParams = Object.assign(config.favicons(), {
			pipeHTML: true,
			replace: true
		});

		return gulp.src(a(faviconsParams.src))
			.pipe($.plumber())
			.pipe($.favicons(faviconsParams))
			.pipe(gulp.dest(a('favicons')));
	});

	/**
	 * Minifies project favicons
	 */
	gulp.task('static:favicons:optimize', () => gulp.src(a('favicons/*'))
		.pipe($.plumber())
		.pipe($.imagemin([$.imagemin.optipng({optimizationLevel: 5})]))
		.pipe(gulp.dest(a('favicons'))));

	/**
	 * Builds and minifies project favicons
	 */
	gulp.task('static:favicons', gulp.series([
		'static:favicons:build',
		'static:favicons:optimize'
	]));

	/**
	 * Minifies project HTML files
	 */
	gulp.task('static:html', () => gulp.src(o('/**/*.html'))
		.pipe($.plumber())
		.pipe($.htmlmin(config.html()))
		.pipe(gulp.dest(o())));

	/**
	 * Minifies project CSS files
	 */
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

	/**
	 * Minifies project JS files
	 */
	gulp.task('static:js', () => {
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
			f(a())
		]);
	});

	/**
	 * Minifies project images
	 */
	gulp.task('static:image', () => {
		function f(src) {
			const
				isArr = Array.isArray(src);

			return gulp.src([path.join(isArr ? src[0] : src, '/**/*.@(png|svg)')].concat(isArr ? src[1] || [] : []))
				.pipe($.plumber())

				.pipe($.imagemin([
					$.imagemin.optipng({optimizationLevel: 5}),
					$.imagemin.svgo()
				]))

				.pipe(gulp.dest(isArr ? src[0] : src));
		}

		return merge([
			f(o()),
			f([a(), `!${path.join(a(), 'favicons/**')}`])
		]);
	});

	/**
	 * Generates WEBP from project images
	 */
	gulp.task('static:image:webp', () => {
		function f(src) {
			$.imagemin.webp = require('imagemin-webp');

			const
				isArr = Array.isArray(src);

			return gulp.src([path.join(isArr ? src[0] : src, '/**/*.@(png|jpg|jpeg)')].concat(isArr ? src[1] || [] : []))
				.pipe($.plumber())
				.pipe($.imagemin([$.imagemin.webp({quality: 100, lossless: true})]))
				.pipe($.extReplace('webp'))
				.pipe(gulp.dest(isArr ? src[0] : src));
		}

		return merge([f(a())]);
	});

	/**
	 * Generates GZ archives from project files
	 */
	gulp.task('static:gzip', gulp.series([
		gulp.parallel([
			'static:image',
			'static:html',
			'static:css',
			'static:js'
		]),

		() => {
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
				f(a())
			]);
		}
	]));

	gulp.task('static', gulp.series(['static:gzip']));
};
