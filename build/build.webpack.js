'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js');

const
	Sugar = require('sugar'),
	path = require('path');

const
	{src, build} = require('config'),
	{config: {dependencies}} = require('@pzlr/build-core');

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
 * Build cache folder
 */
exports.buildCache = path.join(src.cwd(), 'app-cache');

/**
 * Path to assets.json
 */
exports.assetsJSON = path.join(src.clientOutput(), build.assetsJSON());

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
	return `./${path.relative(src.cwd(), path.join(src.clientOutput(), file))}`;
}
