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
	include('build/static.gulp')(gulp);

	const
		{src} = require('config'),
		$ = require('gulp-load-plugins')({scope: ['optionalDependencies']});

	const
		runWebpack = 'npx parallel-webpack',
		args = process.argv.slice(3).join(' ');

	gulp.task('clean:client', () => require('del')(src.clientOutput()));
	gulp.task('build:client', () => $.run(`${runWebpack} -- ${args}`, {verbosity: 3}).exec().on('error', console.error));
	gulp.task('watch:client', () => $.run(`${runWebpack} --watch -- ${args}`, {verbosity: 3}).exec().on('error', console.error));
	global.callGulp(module);
};

module.exports();
