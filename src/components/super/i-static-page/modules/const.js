/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

/**
 * Cache of files
 * @type {object}
 */
exports.files = Object.create(null);

/**
 * Cache of directories
 * @type {null}
 */
exports.folders = Object.create(null);

/**
 * RegExp to determine paths that refer to a folder
 * @type {RegExp}
 */
exports.isFolder = /[/\\]+$/;

/**
 * RegExp to determine URL declaration
 * @type {RegExp}
 */
exports.isURL = /^(\w+:)?\/\//;
