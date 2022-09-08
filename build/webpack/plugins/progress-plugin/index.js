'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	webpack = require('webpack');

const
	ProgressbarView = include('build/webpack/plugins/progress-plugin/progressbar-view');

let
	logger;

/**
 * Create a webpack plugin to show a build process by the passed name
 * @param {string} processName
 */
module.exports = function createProgressPlugin(processName) {
	if (logger == null) {
			logger = new ProgressbarView();
	}

	return new webpack.ProgressPlugin(logger.getProgressHandler(processName));
};
