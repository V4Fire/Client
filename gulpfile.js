/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

require('@config/config');

/**
 * Initializes the specified gulp instance
 * @param gulp
 */
module.exports = function initGulp(gulp = require('gulp')) {
	include('@super/gulpfile', __dirname)(gulp);

	include('build/gulp/static')(gulp);
	include('build/gulp/build')(gulp);

	globalThis.callGulp(module);
};

module.exports();
