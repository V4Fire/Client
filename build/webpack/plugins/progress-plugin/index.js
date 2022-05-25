'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	config = require('@config/config'),
	webpack = require('webpack');

const
	ProgressbarView = include('build/webpack/plugins/progress-plugin/progressbar-view'),
	PrintlnProgressView = include('build/webpack/plugins/progress-plugin/println-progress-view');

/**
 * Create a webpack plugin to show a build process by the passed name
 * @param {string} processName
 */
module.exports = function createProgressPlugin(processName) {
	const
		{type} = config.webpack.progress();

	let
		logger;

	switch (type) {
		case 'println':
			logger = new PrintlnProgressView();
			break;

		case 'progressbar':
			logger = new ProgressbarView();
			break;

		default:
			logger = {getProgressHandler: () => () => undefined};
	}

	return new webpack.ProgressPlugin(logger.getProgressHandler(processName));
};
