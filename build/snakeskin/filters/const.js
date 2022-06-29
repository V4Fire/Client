'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * The RegExp to detect V4Fire specific attributes
 * @type {!RegExp}
 */
exports.isV4Prop = /^(:|@|v-)/;

/**
 * The RegExp to detect V4Fire specific static attributes
 * @type {!RegExp}
 */
exports.isStaticV4Prop = /^[^[]+$/;

/**
 * The RegExp to detect commas
 * @type {!RegExp}
 */
exports.commaRgxp = /\s*,\s*/;

/**
 * The RegExp to detect Snakeskin file extensions
 * @type {!RegExp}
 */
exports.ssExtRgxp = /\.e?ss$/;
