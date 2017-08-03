'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{env, argv} = process;

const
	fs = require('fs'),
	minimist = require('minimist');

/**
 * Process arguments
 */
const args = exports.args = minimist(argv.slice(2));
args.env && (env.NODE_ENV = args.env);

/**
 * Production mode
 */
const isProdEnv = exports.isProdEnv = env.NODE_ENV === 'production';

/**
 * File hash length
 */
const hashLength = exports.hashLength = 15;

/**
 * Project version
 * (for longterm caching)
 */
exports.version = '';

if (isProdEnv) {
	if (env.BUMP_VERSION) {
		if (env.VERSION) {
			exports.version = env.VERSION;

		} else {
			const
				pack = require(d('package.json')),
				v = pack.version.split('.');

			pack.version = [v[0], v[1], Number(v[2]) + 1].join('.');
			env.VERSION = exports.version = `${pack.version.replace(/\./g, '')}_`;
			fs.writeFileSync('./package.json', `${JSON.stringify(pack, null, 2)}\n`);
		}
	}

	if (!args.fast) {
		args.fast = true;
		argv.push('--fast');
	}
}

/* eslint-disable no-unused-vars */

/**
 * Returns WebPack output path string from the specified with hash parameters
 * (for longterm cache)
 *
 * @param {string} output - source string
 * @param {boolean=} [chunk] - if true, then the specified output is a chunk
 */
exports.hash = function (output, chunk) {
	// FIXME: webpack commonChunksPlugin chunkhash bug
	// return str.replace(/\[hash]_/g, isProdEnv ? chunk ? `[chunkhash:${HASH_LENGTH}]_` : `[hash:${HASH_LENGTH}]_` : '');
	return output.replace(/\[hash]_/g, isProdEnv ? `[hash:${hashLength}]_` : '');
};

/* eslint-enable no-unused-vars */
