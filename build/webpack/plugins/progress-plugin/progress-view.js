/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

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
	 * @returns {Function}
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
	 * @returns {number}
	 */
	_convertProgressToPercent(progress) {
		if (progress <= 1) {
			return Math.floor(progress * 100);
		}

		return progress;
	}
};
