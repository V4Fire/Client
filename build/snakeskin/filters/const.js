/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

/**
 * A RegExp to detect V4Fire-specific attributes
 * @type {RegExp}
 */
exports.isV4Prop = /^(:|@|v-)/;

/**
 * A RegExp to detect V4Fire-specific static attributes
 * @type {RegExp}
 */
exports.isStaticV4Prop = /^[^#[]+$/;

/**
 * A RegExp to detect commas
 * @type {RegExp}
 */
exports.commaRgxp = /\s*,\s*/;

/**
 * A RegExp to detect Snakeskin file extensions
 * @type {RegExp}
 */
exports.ssExtRgxp = /\.e?ss$/;

/**
 * A RegExp to detect web component tag
 */
exports.isV4WebComponent = {
	test(_name) {
		return false;
	}
};
