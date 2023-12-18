/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	config = require('@config/config'),
	cliProgress = require('cli-progress');

const
	ProgressView = include('build/webpack/plugins/progress-plugin/progress-view');

/**
 * Class to print progress status by using a dynamic terminal progressbar
 */
module.exports = class ProgressbarView extends ProgressView {
	/**
	 * Formatter for a `cli-progress` MultiBar widget
	 *
	 * @see https://www.npmjs.com/package/cli-progress
	 * @param {object} opts
	 * @param {object} params
	 * @param {object} payload
	 * @returns {string}
	 */
	static formatter(opts, params, payload) {
		const
			name = payload.processName.padEnd(15),
			completeSize = Math.round(params.progress * opts.barsize),
			incompleteSize = opts.barsize - completeSize;

		const bar =
			opts.barCompleteString.substring(0, completeSize) +
			opts.barGlue +
			opts.barIncompleteString.substring(0, incompleteSize);

		return `# ${name} ${bar} ${params.value}%`;
	}

	constructor() {
		super();

		this.multibar = new cliProgress.MultiBar(
			{
				format: ProgressbarView.formatter,
				...config.webpack.progress()?.opts
			},

			cliProgress.Presets.shades_grey
		);
	}

	/**
	 * Create an instance of multibar for the build process
	 * @param {string} processName
	 */
	_createProgressBar(processName) {
		this.handlers[processName] = this.multibar.create(100, 0, {processName});
	}

	/**
	 * Remove an instance of multibar
	 * @param {string} processName
	 */
	_removeProgressBar(processName) {
		this.multibar.remove(this.handlers[processName]);
	}

	/** @override */
	getProgressHandler(processName) {
		this._createProgressBar(processName);

		return this._updateProgress.bind(this, processName);
	}

	/** @override */
	_updateProgress(processName, newProgress) {
		const
			percentage = this._convertProgressToPercent(newProgress),
			currentProgressValue = this.handlers[processName].value;

		if (currentProgressValue > percentage) {
			this._removeProgressBar(processName);
			this._createProgressBar(processName);
		}

		this.handlers[processName].update(percentage);
	}
};
