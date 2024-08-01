/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	{webpack} = require('@config/config'),
	{cacheDir} = include('build/helpers');

/**
 * Returns parameters for `webpack.cache`
 *
 * @param {(number|string)} buildId
 * @returns {(object|boolean)}
 */
module.exports = async function cache({buildId}) {
	switch (webpack.cacheType()) {
		case 'mem':
		case 'memory':
			return {type: 'memory'};

		case 'fs':
		case 'filesystem': {
			const {simpleGit} = require('simple-git');
			const git = simpleGit();
			const
				{current: currentBranch} = await git.status(),
				{latest: lastMerge} = await git.log({'--merges': true, maxCount: 1});

			return {
				name: String(buildId),
				type: 'filesystem',
				version: currentBranch + lastMerge.hash,
				cacheDirectory: cacheDir
			};
		}

		default:
			return false;
	}
};
