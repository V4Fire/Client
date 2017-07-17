'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js'),
	fs = require('fs'),
	path = require('path');

const
	{env, argv} = process;

/**
 * Project work directory
 */
const cwd = exports.cwd = process.cwd();

/**
 * Process arguments
 */
const args = exports.args = require('minimist')(argv.slice(2));

if (args.env) {
	env.NODE_ENV = args.env;
}

const
	pack = require(d('package.json')),
	isProdEnv = env.NODE_ENV === 'production';

/**
 * Project config
 */
const config = exports.config = require('config');

/**
 * File hash length
 */
const HASH_LENGTH = exports.HASH_LENGTH = 15;

/**
 * Project version
 * (for longterm caching)
 */
let VERSION = exports.VERSION = '';

if (isProdEnv) {
	if (env.BUMP_VERSION) {
		if (env.VERSION) {
			VERSION = env.VERSION;

		} else {
			const v = pack.version.split('.');
			pack.version = [v[0], v[1], Number(v[2]) + 1].join('.');
			env.VERSION = VERSION = `${pack.version.replace(/\./g, '')}_`;
			fs.writeFileSync('./package.json', `${JSON.stringify(pack, null, 2)}\n`);
		}
	}

	if (!args.fast) {
		args.fast = true;
		argv.push('--fast');
	}
}

/**
 * Babel config
 */
const babel = exports.babel = {
	base: $C.extend(
		{
			deep: true,
			concatArray: true
		},

		{},

		config.babel.base,
		config.babel.client
	),

	get withRuntime() {
		const
			config = $C.extend(true, {}, this.base),
			pl = config.plugins,
			pos = $C(pl).search((el) => (Array.isArray(el) ? el[0] : el) === 'transform-runtime');

		pl[pos === -1 ? pl.length : pos] = ['transform-runtime', {
			helpers: false,
			polyfill: false,
			regenerator: false
		}];

		return pl;
	}
};

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
	return output.replace(/\[hash]_/g, isProdEnv ? `[hash:${HASH_LENGTH}]_` : '');
};

exports.d = d;

/**
 * Returns full path to the specified file relative to process.cwd()
 *
 * @param {string} file
 * @returns {string}
 */
function d(file) {
	return path.join(cwd, file);
}
