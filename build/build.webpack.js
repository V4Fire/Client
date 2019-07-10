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
	path = require('path');

const
	{src, webpack} = require('config'),
	{config: {dependencies}} = require('@pzlr/build-core');

/**
 * String with project dependencies for using with regular expressions
 */
exports.depsRgxpStr = dependencies.map((el) => RegExp.escape(el || el.src)).join('|');

/**
 * Output pattern
 */
exports.output = hash(webpack.output());

/**
 * Output pattern for assets
 */
exports.assetsOutput = hash(webpack.assetsOutput());

/**
 * Path to assets.json
 */
exports.assetsJSON = path.join(src.clientOutput(), webpack.assetsJSON());

/**
 * Path to assets.js
 */
exports.assetsJS = path.join(src.clientOutput(), webpack.assetsJS());

/**
 * Path to dll-manifest.json
 */
exports.dllManifest = path.join(src.clientOutput(), webpack.dllOutput({name: 'dll-manifest.json', hash: null}));

/**
 * Build cache folder
 */
exports.buildCache = path.join(src.cwd(), 'app-cache');

// Some helpers

exports.hash = hash;
exports.hashRgxp = /\[(chunk)?hash(:\d+)?]_/g;

/**
 * Returns WebPack output path string from the specified with hash parameters
 * (for longterm cache)
 *
 * @param {string} output - source string
 * @param {boolean=} [chunk] - if true, then the specified output is a chunk
 */
function hash(output, chunk) {
	const l = webpack.hashLength;
	return output.replace(exports.hashRgxp, chunk ? `[chunkhash:${l}]_` : `[hash:${l}]_`);
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
