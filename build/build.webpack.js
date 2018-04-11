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
	Sugar = require('sugar');

const
	{env, argv} = process,
	{src} = require('config'),
	{normalizeSep} = include('build/helpers'),
	{config: {dependencies}} = require('@pzlr/build-core');

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
 * String with project dependencies for using with regular expressions
 */
exports.depsRgxpStr = dependencies.map((el) => RegExp.escape(el || el.src)).join('|');

/**
 * File hash length
 */
exports.hashLength = 15;

/**
 * Output pattern
 */
exports.output = hash(r('[hash]_[name]'));

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
 * Build cache folder
 */
exports.buildCache = path.join(src.cwd(), 'app-cache');

/**
 * Path to assets.json
 */
exports.assetsJSON = r(`${exports.version}assets.json`);

// Some helpers

exports.hash = hash;

/**
 * Returns WebPack output path string from the specified with hash parameters
 * (for longterm cache)
 *
 * @param {string} output - source string
 * @param {boolean=} [chunk] - if true, then the specified output is a chunk
 */
function hash(output, chunk) {
	const l = exports.hashLength;
	return output.replace(/\[hash]_/g, isProd ? chunk ? `[chunkhash:${l}]_` : `[hash:${l}]_` : '');
}

exports.inherit = inherit;

/**
 * Alias for $C.extend({deep, concatArray})
 */
function inherit() {
	const extOpts = {
		deep: true,
		concatArray: true,
		concatFn: Sugar.Array.union
	};

	return $C.extend(extOpts, {}, ...arguments);
}

function r(file) {
	return `./${normalizeSep(path.relative(src.cwd(), path.join(src.clientOutput(), file)))}`;
}
