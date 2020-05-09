'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{src} = require('config');

module.exports = function (gulp = require('gulp')) {
	const
		$ = require('gulp-load-plugins')({scope: ['optionalDependencies']});

	const
		args = process.argv.slice(3).join(' ');

	gulp.task('clean:client', () =>
		require('del')(src.clientOutput())
	);

	gulp.task('build:client', () =>
		$.run(`npx parallel-webpack -- ${args}`, {verbosity: 3}).exec().on('error', console.error)
	);

	gulp.task('watch:client', () =>
		$.run(`npx webpack --watch ${args}`, {verbosity: 3}).exec().on('error', console.error)
	);
};
