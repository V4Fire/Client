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
	webpack = require('webpack'),
	ProgressbarView = include('build/webpack/plugins/progress-plugin/progressbar-view'),
	PrintlnProgressView = include('build/webpack/plugins/progress-plugin/println-progress-view');

const
	progressBarView = new ProgressbarView(),
	printlnProgressView = new PrintlnProgressView();

/**
 * Create webpack plugin to show progress of build
 */
function createProgressPlugin(name) {
	const {type} = config.progressPlugin();
	let activeProgressIndicator;

	switch (type) {
		case 'static':
			activeProgressIndicator = printlnProgressView;
			break;

		case 'dynamic':
			activeProgressIndicator = progressBarView;
			break;

		default:
			// eslint-disable-next-line no-empty-function
			activeProgressIndicator = () => {};
	}

	return new webpack.ProgressPlugin(activeProgressIndicator.getProgressHandler(name));
}

module.exports = createProgressPlugin;
