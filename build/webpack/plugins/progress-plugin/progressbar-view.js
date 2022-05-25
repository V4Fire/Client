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
	 * @param opts
	 * @param params
	 * @param payload
	 * @returns {string}
	 */
	static formatter(opts, params, payload) {
		const
			name = payload.name.padEnd(15).capitalize(),
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
				...config.progressPlugin().opts
			},

			cliProgress.Presets.shades_grey
		);
	}

	/** @override */
	getProgressHandler(name) {
		this.handlers[name] = this.multibar.create(100, 0, {name});
		return this._updateProgress.bind(this, name);
	}

	/** @override */
	_updateProgress(processName, newProgress) {
		this.handlers[processName].update(this._convertProgressToPercent(newProgress));
		super._updateProgress(processName, newProgress);
	}
};
