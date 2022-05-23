'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const chalk = require('chalk');

/**
 * Class for simple display of build progress
 * prints the status to the console at every change in the build progress
 */
class PrintlnProgressView {
	constructor() {
		this.handlers = {};
		this.finishedProcessCounter = 0;
		this.startTime = new Date();
		this.enableLog = true;
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
	 * Adds a handler to log the build process
	 *
	 * @param {string} name
	 */
	getProgressHandler(name) {
		this.handlers[name] = true;

		if (this.enableLog) {
			console.log(`Started build step ${name}`);
		}

		return this.progressUpdate.bind(this, name);
	}

	/**
	 * Handler: updates a build progress status by the passed name
	 *
	 * @param {string} name
	 * @param {number} newProgress - a number between 0 and 1 indicating the completion of the build
	 */
	progressUpdate(name, newProgress) {
		const percentage = this.convertToPercentage(newProgress);

		if (this.enableLog) {
			console.log(`${name}: ${percentage}%`);
		}

		if (percentage === 100) {
			this.finishProcess(name);
		}
	}

	/**
	 * Prints the message with execution time of the build process
	 *
	 * @param {string} name
	 */
	finishProcess(name) {
		const executionTime = new Date() - this.startTime,
			executionTimeInSeconds = Math.round(executionTime / 1000);

		if (this.enableLog) {
			console.log(
				chalk.green(
					`Build step ${name} has finished in ${executionTimeInSeconds} seconds`
				)
			);
		}

		this.finishedProcessCounter++;

		if (this.finishedProcessCounter === Object.size(this.handlers)) {
			console.log(
				chalk.blue(`Webpack build takes ${executionTimeInSeconds} seconds`)
			);
		}
	}
}

module.exports = PrintlnProgressView;
