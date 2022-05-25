/* eslint-disable no-unused-vars */

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

module.exports = class ProgressView {
	constructor() {
		this.handlers = {};
		this.finishedProcess = 0;
		this.startTime = new Date();
	}

	/**
	 * Returns a progress handler for the specified build process by a name
	 *
	 * @param {string} processName
	 * @returns {!Function}
	 */
	getProgressHandler(processName) {
		this.handlers[processName] = true;
		return this._updateProgress.bind(this, processName);
	}

	/**
	 * Converts a progress status into the percentage representation
	 *
	 * @protected
	 * @param {number} progress
	 */
	_convertProgressToPercent(progress) {
		if (progress <= 1) {
			return Math.floor(progress * 100);
		}

		return progress;
	}

	/**
	 * Updates a process build progress by the passed name
	 *
	 * @protected
	 * @param {string} processName
	 * @param {number} newProgress
	 */
	_updateProgress(processName, newProgress) {
		const
			percentage = this._convertProgressToPercent(newProgress);

		if (percentage === 100) {
			this._finishProgress(processName);
		}
	}

	/**
	 * Prints a message with the execution time of a build process by the passed name
	 *
	 * @protected
	 * @param {string} processName
	 */
	_finishProgress(processName) {
		const
			executionTime = Date.now() - this.startTime,
			executionTimeInSeconds = Math.round(executionTime.seconds());

		this.finishedProcess++;

		if (this.finishedProcess === Object.size(this.handlers)) {
			console.log('\n');

			console.log(
				chalk.blue(`Webpack build takes ${executionTimeInSeconds} seconds`)
			);
		}
	}
};
