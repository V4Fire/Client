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
	{getHead} = require('./helpers');

gulp.task('setProd', (cb) => {
	process.env.NODE_ENV = 'production';
	cb();
});

gulp.task('copyright', (cb) => {
	const
		replace = require('gulp-replace');

	gulp.src('./LICENSE')
		.pipe(replace(/(Copyright \(c\) )(\d+)-?(\d*)/, (str, intro, from, to) => {
			const year = new Date().getFullYear();
			return intro + from + (to || from !== year ? `-${year}` : '');
		}))

		.pipe(gulp.dest('./'))
		.on('end', cb);
});

gulp.task('lf', (cb) => {
	const
		convertNewline = require('gulp-convert-newline');

	gulp.src(['./@(src|config|build|web_loaders)/**/*', './*'], {base: './'})
		.pipe(convertNewline())
		.pipe(gulp.dest('./'))
		.on('end', cb);
});

gulp.task('head', (cb) => {
	const
		through = require('through2'),
		replace = require('gulp-replace'),
		header = require('gulp-header');

	const
		fullHead = `${getHead()} */\n\n`,
		headRgxp = /(\/\*![\s\S]*?\*\/\n{2})/;

	gulp.src(['./@(src|config|build|web_loaders)/**/*.@(js|styl|ss)', './@(index|gulpfile|webpack.config).js'], {base: './'})
		.pipe(through.obj(function (file, enc, cb) {
			if (!headRgxp.exec(file.contents.toString()) || RegExp.$1 !== fullHead) {
				this.push(file);
			}

			return cb();
		}))

		.pipe(replace(headRgxp, ''))
		.pipe(header(fullHead))
		.pipe(gulp.dest('./'))
		.on('end', cb);
});
