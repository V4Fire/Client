'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

Object.assign(exports, include('@super/build/const', __dirname));

const
	{depsRgxpStr} = exports;

/**
 * RegExp to detect file paths that are registered as dependencies within ".pzlrrc"
 * @type {RegExp}
 *
 * @example
 * **.pzlrrc**
 * ```json
 * {
 *   dependencies: ['@v4fire/client', '@v4fire/core']
 * }
 * ```
 *
 * ```js
 * isLayerDep.test('./node_modules/@v4fire/client/bla')              // true
 * isLayerDep.test('./node_modules/@v4fire/client/node_modules/bla') // false
 * isLayerDep.test('./node_modules/bla')                             // false
 * ```
 */
exports.isLayerDep = new RegExp(
	`(?:^|[\\\\/])node_modules[\\/](?:${depsRgxpStr})(?:[\\\\/]|$)|^(?:(?!(?:^|[\\\\/])node_modules[\\\\/]).)*$`
);

/**
 * RegExp to detect file paths that aren't registered as dependencies within ".pzlrrc"
 * @type {RegExp}
 *
 * @example
 * **.pzlrrc**
 * ```json
 * {
 *   dependencies: ['@v4fire/client', '@v4fire/core']
 * }
 * ```
 *
 * ```js
 * isExternalDep.test('./node_modules/@v4fire/client/bla')              // false
 * isExternalDep.test('./node_modules/@v4fire/client/node_modules/bla') // true
 * isExternalDep.test('./node_modules/bla')                             // true
 * ```
 */
exports.isExternalDep = new RegExp(
	`^(?:(?!(?:^|[\\\\/])node_modules[\\\\/]).)*[\\\\/]?node_modules[\\\\/](?:(?!${depsRgxpStr}).)*$`
);
