'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{validators} = require('@pzlr/build-core');

/**
 * RegExp to match the "a:void" tag snippet
 */
exports.isVoidLink = /^a:void$/;

/**
 * RegExp to match the "button:a" tag snippet
 */
exports.isButtonLink = /^button:a$/;

/**
 * RegExp to match a tag declaration body
 *
 * @example
 * ```
 * <div class="foo">
 * ```
 */
exports.tagRgxp = /<[^>]+>/;

/**
 * RegExp to match a component element class
 *
 * @example
 * ```
 * b-foo__bla-bar
 * ```
 */
exports.componentElRgxp = new RegExp(`\\b${validators.baseBlockName}__[a-z0-9][a-z0-9-_]*\\b`);

/**
 * RegExp to match declaration of an object literal
 *
 * @example
 * ```
 * [1, 2]
 * {a: 1}
 * ```
 */
exports.isObjLiteral = /^\s*[[{]/;

/**
 * RegExp to match requiring of svg images
 *
 * @example
 * ```
 * require('foo.svg')
 * ```
 */
exports.isSvgRequire = /require\(.*?\.svg[\\"']+\)/;

/**
 * RegExp to detect V4Fire specific attributes
 */
exports.isV4Prop = /^(:|@|v-)/;

/**
 * RegExp to detect V4Fire specific static attributes
 */
exports.isStaticV4Prop = /^[^[]+$/;

/**
 * RegExp to detect commas
 */
exports.commaRgxp = /\s*,\s*/;

/**
 * RegExp to detect Snakeskin file extensions
 */
exports.ssExtRgxp = /\.e?ss$/;

/**
 * RegExp to match tags that support the nonce attribute
 */
exports.tagNonceRgxp = /^(['"])<(link|script)([^>]*)>/;
