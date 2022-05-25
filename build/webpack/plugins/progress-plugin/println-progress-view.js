'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	chalk = require('chalk');

const
	ProgressView = include('build/webpack/plugins/progress-plugin/progress-view');

/**
 * Class to print progress status by simple `console.log` messages
 */
module.exports = class PrintlnProgressView extends ProgressView {
	constructor() {
		super();
		this.finishedProcess = 0;
		this.startTime = new Date();
	}

	/** @override */
	getProgressHandler(processName) {
		console.log(`Started a build step ${processName}`);
		return super.getProgressHandler(processName);
	}

	/** @override */
	_updateProgress(processName, newProgress) {
		console.log(`# ${processName.padEnd(10)} : ${this._convertProgressToPercent(newProgress)}%`);
		super._updateProgress(processName);
	}

	/**
	 * Prints a message with the execution time of a build process by the passed name
	 *
	 * @override
	 * @param {string} processName
	 */
	_finishProgress(processName) {
		const
			executionTime = Date.now() - this.startTime,
			executionTimeInSeconds = Math.round(executionTime.seconds());

		console.log(
			chalk.green(`Build step ${processName} has finished in ${executionTimeInSeconds} seconds`)
		);

		super._finishProgress(processName);
	}
};
