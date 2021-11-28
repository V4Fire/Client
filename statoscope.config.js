'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const {statoscope} = require('config');

const statoscopeConfig = statoscope();

module.exports = {
	validate: {
		plugins: ['@statoscope/webpack'],
		reporters: [
			'@statoscope/console',
			['@statoscope/stats-report', {open: statoscopeConfig.openReport}]
		],

		rules: {
			'@statoscope/webpack/no-packages-dups': ['error'],
			'@statoscope/webpack/diff-entry-download-size-limits': [
				'error',
				{
					global: {
						maxSizeDiff: statoscopeConfig.entryDownloadSizeLimits
					}
				}
			],

			'@statoscope/webpack/diff-entry-download-time-limits': [
				'error',
				{
					global: {
						maxDownloadTimeDiff: statoscopeConfig.entryDownloadTimeLimits
					}
				}
			]
		}
	}
};
