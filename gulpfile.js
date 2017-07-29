'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

module.exports = function (gulp = require('gulp')) {
	require('@v4fire/core/gulpfile')(gulp);
	require('./build/static.gulp')(gulp);

	const
		runWebpack = 'node node_modules/parallel-webpack/bin/run.js',
		args = process.argv.slice(3).join(' ');

	gulp.task('cleanClient', (cb) => {
		const del = require('del');
		del('./dist/packages').then(() => cb(), cb);
	});

	gulp.task('client', (cb) => {
		const run = require('gulp-run');
		run(`${runWebpack} -- ${args}`, {verbosity: 3})
			.exec()
			.on('finish', cb);
	});

	gulp.task('watchClient', () => {
		const run = require('gulp-run');
		run(`${runWebpack} --watch -- ${args}`, {verbosity: 3}).exec();
	});
};

module.exports();
