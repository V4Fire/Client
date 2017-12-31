'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{env, argv} = process,
	{src} = require('config');

const
	fs = require('fs'),
	path = require('path'),
	minimist = require('minimist');

/**
 * Process arguments
 */
const args = exports.args = minimist(argv.slice(2));
args.env && (env.NODE_ENV = args.env);

/**
 * Output pattern
 */
exports.output = r('[hash]_[name]');

/**
 * File hash length
 */
exports.hashLength = 15;

/**
 * Project version
 * (for longterm caching)
 */
exports.version = '';

if (isProd) {
	if (Number(env.BUMP_VERSION)) {
		if (env.VERSION) {
			exports.version = env.VERSION;

		} else {
			const
				src = include('package.json'),
				pack = require(src),
				v = pack.version.split('.');

			pack.version = [v[0], v[1], Number(v[2]) + 1].join('.');
			env.VERSION = exports.version = `${pack.version.replace(/\./g, '')}_`;
			fs.writeFileSync(src, `${JSON.stringify(pack, null, 2)}\n`);
		}
	}

	if (!args.fast) {
		args.fast = true;
		argv.push('--fast');
	}
}

/**
 * Path to assets.json
 */
exports.assetsJSON = r(`${version}assets.json`);

/* eslint-disable no-unused-vars */

/**
 * Returns WebPack output path string from the specified with hash parameters
 * (for longterm cache)
 *
 * @param {string} output - source string
 * @param {boolean=} [chunk] - if true, then the specified output is a chunk
 */
exports.hash = function (output, chunk) {
	const l = exports.hashLength;
	return output.replace(/\[hash]_/g, isProd ? chunk ? `[chunkhash:${l}]_` : `[hash:${l}]_` : '');
};

/* eslint-enable no-unused-vars */

function r(file) {
	return `./${path.relative(src.cwd(), path.join(src.clientOutput(), file)).replace(/\\/g, '/')}`;
}
