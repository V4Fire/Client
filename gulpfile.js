'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

require('config');

module.exports = function (gulp = require('gulp')) {
	include('@super/gulpfile', __dirname)(gulp);

	include('build/static.gulp')(gulp);
	include('build/build.gulp')(gulp);
	include('build/test.gulp')(gulp);

	global.callGulp(module);
};

module.exports();
