'use strict';

const
	{promises: fs} = require('fs'),
	path = require('path');

const
	{statoscope} = require('@config/config'),
	{entryDownloadDiffSizeLimits, entryDownloadDiffTimeLimits} = statoscope();

const resolveLimits =
	(config, diffSizeLimit, diffTimeLimit) => config
		.replace('$entryDownloadDiffSizeLimits', diffSizeLimit)
		.replace('$entryDownloadDiffTimeLimits', diffTimeLimit);

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
