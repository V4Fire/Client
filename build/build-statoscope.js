/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	fs = require('node:fs'),
	{statoscope} = require('@config/config'),
	{entryDownloadDiffSizeLimits, entryDownloadDiffTimeLimits} = statoscope();

const
	configTemplate = include('.statoscope', {return: 'source'});

/**
 * Builds the statoscope configuration file.
 *
 * The function processes template statoscope config file and
 * generates actual statoscope config with predefined limits from config.
 *
 * @param {string} buildName - name of build process
 */
function buildStatoscopeConfig(buildName) {
	const
		diffSizeLimit = entryDownloadDiffSizeLimits[buildName],
		diffTimeLimit = entryDownloadDiffTimeLimits[buildName];

	const config = `module.exports = ${configTemplate}`
		.replace('$entryDownloadDiffSizeLimits', diffSizeLimit)
		.replace('$entryDownloadDiffTimeLimits', diffTimeLimit);

	fs.writeFileSync(`./statoscope-${buildName}.config.js`, config);
}

const [buildType] = process.argv.slice(2);

buildStatoscopeConfig(buildType);
