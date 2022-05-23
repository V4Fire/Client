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

const PrintlnProgressView = include('build/webpack/plugins/progress-plugin/println-progress-view');

/**
 * Class for displaying build process
 * with dynamic progress bar in terminal
 */
 class ProgressbarView extends PrintlnProgressView {
	constructor() {
		super();
		this.enableLog = false;

		function formatter(options, params, payload) {
			const completeSize = Math.round(params.progress * options.barsize);
			const incompleteSize = options.barsize - completeSize;
			const bar =
				options.barCompleteString.substr(0, completeSize) +
				options.barGlue +
				options.barIncompleteString.substr(0, incompleteSize);

			const name = payload.name.padEnd(15).capitalize();

			return `# ${name} ${bar} ${params.value}%`;
		}

		this.multibar = new cliProgress.MultiBar(
			{
				format: formatter,
				...config.progressPlugin()
			},
			cliProgress.Presets.shades_grey
		);
	}

	getProgressHandler(name) {
		this.handlers[name] = this.multibar.create(100, 0, {name});

		return this.progressUpdate.bind(this, name);
	}

	progressUpdate(name, newProgress) {
		const percentage = this.convertToPercentage(newProgress);

		this.handlers[name].update(percentage);

		super.progressUpdate(name, newProgress);
	}
}

module.exports = ProgressbarView;
