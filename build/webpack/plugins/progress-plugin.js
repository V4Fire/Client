'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const config = require('@config/config'),
	cliProgress = require('cli-progress'),
	chalk = require('chalk'),
	webpack = require('webpack');

/**
 * Class for simple logging webpack build progress
 */
class BaseProgressIndicator {
	constructor() {
		this.handlers = {};
		this.finishedHandlersCounter = 0;
		this.startTime = new Date();
		this.enableLog = true;
	}

	/**
	 * Wrapper of updating method for webpack
	 *
	 * @param {string} name
	 * @param {number} value
	 */
	webpackHandler(name, value) {
		this.updateProgress(name, value);
	}

	/**
	 * Convert value into percentage representation
	 *
	 * @param {number} value
	 */
	convertToPercentage(value) {
		return Math.floor(value * 100);
	}

	/**
	 * Add handler for logging build process
	 *
	 * @param {string} name
	 */
	addHandler(name) {
		this.handlers[name] = true;

		if (this.enableLog) {
			console.log(`Started build step ${name}`);
		}

		return this.webpackHandler.bind(this, name);
	}

	/**
	 * Updates status of build by name
	 *
	 * @param {string} name
	 * @param {number} value
	 */
	updateProgress(name, value) {
		const percentage = this.convertToPercentage(value);

		if (this.enableLog) {
			console.log(`${name}: ${percentage}%`);
		}

		if (percentage === 100) {
			this.handleFinishProgress(name);
		}
	}

	/**
	 * Handle finish of one build process
	 * If all processes finished print execution time
	 *
	 * @param {string} name
	 */
	handleFinishProgress(name) {
		const executionTime = new Date() - this.startTime;
		const exectionTimeInSeconds = Math.floor(executionTime / 1000);

		if (this.enableLog) {
			console.log(
				chalk.green(
					`Build step ${name} has finished in ${exectionTimeInSeconds} seconds`
				)
			);
		}

		this.finishedHandlersCounter++;

		if (this.finishedHandlersCounter === Object.keys(this.handlers).length) {
			console.log(
				chalk.blue(`Webpack build takes ${exectionTimeInSeconds} seconds`)
			);
		}
	}
}

/**
 * Class for visualization webpack progress with load bar
 */
class ProgressIndicator extends BaseProgressIndicator {
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

	addHandler(name) {
		this.handlers[name] = this.multibar.create(100, 0, {name});

		return this.webpackHandler.bind(this, name);
	}

	updateProgress(name, value) {
		const percentage = this.convertToPercentage(value);

		this.handlers[name].update(percentage);

		super.updateProgress(name, value);
	}
}

const progressIndicator = new ProgressIndicator();
const baseProgressIndicator = new BaseProgressIndicator();

/**
 * Create webpack plugin to show progress of build
 */
function createProgressPlugin(name) {
	const {version} = config.progressPlugin();
	let activeProgressIndicator;

	if (version === 'static') {
		activeProgressIndicator = baseProgressIndicator;
	} else if (version === 'dynamic') {
		activeProgressIndicator = progressIndicator;
	}

	return new webpack.ProgressPlugin(activeProgressIndicator.addHandler(name));
}

module.exports = createProgressPlugin;
