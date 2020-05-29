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
	config = require('config'),
	path = require('path');

const
	{src, build, webpack: wp} = config,
	{config: {dependencies}} = require('@pzlr/build-core');

const
	hashRgxp = /\[(chunk)?hash(:\d+)?]_/g;

/**
 * String with project dependencies for using with regular expressions
 */
exports.depsRgxpStr = dependencies.map((el) => {
	const src = Object.isString(el) ? el : el.src;
	return src.split(/[\\/]/).map(RegExp.escape).join('[\\\\/]');
}).join('|');

/**
 * Output pattern
 */
exports.output = hash(wp.output());

/**
 * Output pattern for assets
 */
exports.assetsOutput = hash(wp.assetsOutput());

/**
 * Path to assets.json
 */
exports.assetsJSON = path.join(src.clientOutput(), wp.assetsJSON());

/**
 * Path to assets.js
 */
exports.assetsJS = path.join(src.clientOutput(), wp.assetsJS());

/**
 * Path to dll-manifest.json
 */
exports.dllManifest = path.join(src.clientOutput(), wp.dllOutput({name: 'dll-manifest.json', hash: null}));

/**
 * Build cache folder
 */
exports.buildCache = path.join(src.cwd(), 'app-cache');

// Some helpers

exports.hash = hash;
exports.hashRgxp = hashRgxp;

/**
 * Returns WebPack output path string from the specified with hash parameters
 * (for longterm cache)
 *
 * @param {string} output - source string
 * @param {boolean=} [chunk] - if true, then the specified output is a chunk
 */
function hash(output, chunk) {
	return output.replace(hashRgxp, chunk ? `[chunkhash:${build.hashLength}]_` : `[hash:${build.hashLength}]_`);
}

exports.inherit = inherit;

/**
 * Alias for $C.extend({deep, concatArray})
 */
function inherit() {
	const extOpts = {
		deep: true,
		concatArray: true,
		concatFn: Array.union
	};

	return $C.extend(extOpts, {}, ...arguments);
}
