/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	rspack = require('@rspack/core');

const
	ProgressbarView = include('build/webpack/plugins/progress-plugin/progressbar-view');

let
	logger;

/**
 * Create a webpack plugin to show a build process by the passed name
 *
 * @param {string} processName
 * @returns {import('webpack').ProgressPlugin}
 */
module.exports = function createProgressPlugin() {
	if (logger == null) {
		logger = new ProgressbarView();
	}

	return new rspack.ProgressPlugin();
};
