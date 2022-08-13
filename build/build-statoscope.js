'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{promises: fs} = require('fs'),
	path = require('path');

const
	{statoscope} = require('@config/config'),
	{entryDownloadDiffSizeLimits, entryDownloadDiffTimeLimits} = statoscope();

/**
 * The function generates statoscope configuration file
 * using values from config and template.
 *
 * @param {string} config
 * @param {number} diffSizeLimit
 * @param {number} diffTimeLimit
 * @returns {string}
 */
const resolveLimits =
	(config, diffSizeLimit, diffTimeLimit) => config
		.replace('$entryDownloadDiffSizeLimits', diffSizeLimit)
		.replace('$entryDownloadDiffTimeLimits', diffTimeLimit);

/**
 * Builds `.statoscope` file.
 * The function processes template statoscope config file and
 * generates actual statoscope config with predefined limits from config.
 *
 * @param buildType - name of build process
 */
async function buildStatoscopeConfig(buildType) {
	const
		configTemplate = await fs.readFile(path.resolve(__dirname, '../.statoscope')),
		diffSizeLimit = entryDownloadDiffSizeLimits[buildType],
		diffTimeLimit = entryDownloadDiffTimeLimits[buildType],
		configPath = `./statoscope-${buildType}.config.js`,
		config = `module.exports = ${configTemplate}`;

	await fs.writeFile(configPath, resolveLimits(config, diffSizeLimit, diffTimeLimit));
}

const [buildType] = process.argv.slice(2);

buildStatoscopeConfig(buildType);
