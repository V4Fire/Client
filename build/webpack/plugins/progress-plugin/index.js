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

const
	progressBarView = new ProgressbarView(),
	printlnProgressView = new PrintlnProgressView();

/**
 * Create a webpack plugin to show a build process by the passed name
 * @param {string} processName
 */
module.exports = function createProgressPlugin(processName) {
	const
		{type} = config.progressPlugin();

	let
		logger;

	switch (type) {
		case 'println':
			logger = printlnProgressView;
			break;

		case 'progressbar':
			logger = progressBarView;
			break;

		default:
			logger = () => undefined;
	}

	return new webpack.ProgressPlugin(logger.getProgressHandler(processName));
};
