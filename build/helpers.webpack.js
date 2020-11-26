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
	{src, build, webpack: wp} = config;

const
	hashRgxp = /\[(chunk)?hash(:\d+)?]_/g;

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
 * Cache folder
 */
exports.cacheDir = path.join(src.cwd(), 'app-cache', build.hash());

// Some helpers

exports.hash = hash;
exports.hashRgxp = hashRgxp;

/**
 * Returns a WebPack output path string from the specified string with hash parameters
 * (for the longterm caching)
 *
 * @param {string} output - source string
 * @param {boolean=} [chunk] - if true, then the specified output is a chunk
 */
function hash(output, chunk) {
	return output.replace(hashRgxp, chunk ? `[chunkhash:${build.hashLength}]_` : `[contenthash:${build.hashLength}]_`);
}

exports.inherit = inherit;

/**
 * Alias for $C.extend({deep, concatArray})
 */
function inherit(...args) {
	const extOpts = {
		deep: true,
		concatArray: true,
		concatFn: Array.union
	};

	return $C.extend(extOpts, {}, ...args);
}

exports.isStandalone = isStandalone;

/**
 * Returns true if the specified entry point is standalone
 *
 * @param {string} entryPoint
 * @returns {boolean}
 */
function isStandalone(entryPoint) {
	return entryPoint === 'std' || /\.(worker|standalone)\b/.test(entryPoint);
}
