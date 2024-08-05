/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	path = require('upath');

const
	{build} = require('@config/config'),
	{config: {projectName, dependencies, sourceDir}, resolve} = require('@pzlr/build-core');

// eslint-disable-next-line no-multi-assign
module.exports = exports = include('@super/build/const', __dirname);

let
	buildIterator = 0;

/**
 * Index of a process that creates `.html` files
 * @type {number}
 */
exports.HTML = buildIterator++;

/**
 * Index of a process that generates `.js` files
 * @type {number}
 */
exports.RUNTIME = buildIterator++;

/**
 * Index of a process that generates isolated files for workers
 * @type {number}
 */
exports.STANDALONE = buildIterator++;

/**
 * Index of a process that generates styles
 * @type {number}
 */
exports.STYLES = buildIterator;

/**
 * Position of the last available process
 * @type {number}
 */
exports.buildIterator = buildIterator;

/**
 * The minimum number of the used process to build
 * @type {number}
 */
exports.MIN_PROCESS = buildIterator + 1;

/**
 * The maximum number of the used process to build
 * @type {number}
 */
exports.MAX_PROCESS = build.processes > exports.MIN_PROCESS ? build.processes : exports.MIN_PROCESS;

/**
 * The maximum number of tasks per one building process
 * @type {number}
 */
exports.MAX_TASKS_PER_ONE_PROCESS = 3;

/**
 * List of critical core folders of the framework
 * @type {Array<string>}
 */
exports.coreFolders = ['config', 'core', 'super', 'global'];

/**
 * String with project dependence "src" folders to use with regular expressions
 */
exports.depsSrcRgxpStr = [path.join(projectName, sourceDir)]
	.concat(dependencies)

	.map((el, i) => {
		let
			src = Object.isString(el) ? el : el.src;

		if (i > 0) {
			src = resolve.rootDependencies[i - 1].replace(new RegExp(`.*?(?=${RegExp.escape(el)})`), '');
		}

		return src.split(/[\\/]/).map(RegExp.escape).join('[\\\\/]');
	})

	.join('|');

const
	coreFolders = exports.coreFolders.join('|');

/**
 * RegExp to detect file paths that are registered as dependencies within `.pzlrrc` and
 * are placed within "core" folders
 *
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
 * isLayerCoreDep.test('./node_modules/@v4fire/client/core/bla')         // true
 * isLayerCoreDep.test('./node_modules/@v4fire/client/super/bla')        // true
 * isLayerCoreDep.test('./node_modules/@v4fire/client/bla')              // false
 * isLayerCoreDep.test('./node_modules/@v4fire/client/node_modules/bla') // false
 * isLayerCoreDep.test('./node_modules/bla')                             // false
 * ```
 */
exports.isLayerCoreDep = new RegExp(
	'' +

	// Layer imports
	`(?:^|[\\\\/])node_modules[\\\\/](?:${exports.depsSrcRgxpStr})[\\\\/](?:${coreFolders})(?:[\\\\/]|$)` +

	'|' +

	// Simple imports
	`(?:src[\\\\/]|^)(?:${coreFolders})(?:(?![\\\\/]node_modules[\\\\/]).)*$`
);

/**
 * Pattern to match comments within `import/export` declarations
 * @type {string}
 */
exports.commentModuleExpr = '\\s*(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*';

/**
 * RegExp to detect file paths that are used as polyfills (std / core.js)
 */
exports.isPolyfillRegExp = /(\/core\/(std.ts|shims))|(\/node_modules\/core-js\/)/;
