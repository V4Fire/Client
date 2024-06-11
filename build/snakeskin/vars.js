/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const path = require('upath');

/**
 * Super-global variables
 * @type {object}
 */
const {Vars} = require('snakeskin');

module.exports = {
	/**
	 * Saves the basename of the specified directory to the global namespace under the provided aliases.
	 * It should be used through the `eval` directive.
	 *
	 * @param {string} dirname
	 * @param {...Array<string>} aliases
	 *
	 * @example
	 * ```
	 * - namespace b-window
	 *
	 * - eval
	 *  ? @@saveTplDir(__dirname, 'windowSlotEmptyTransactions')
	 *
	 * - block index->windowSlotEmptyTransactions(nms)
	 *   < ?.${nms}
	 *     Hello world!
	 * ```
	 */
	saveTplDir(dirname, ...aliases) {
		const dir = path.basename(dirname);

		if (!Vars['globalTplDirs']) {
			Vars['globalTplDirs'] = {};
		}

		Object.forEach(aliases, (name) => {
			if (!Vars['globalTplDirs'][name]) {
				Vars['globalTplDirs'][name] = dir;

			} else if (Vars['globalTplDirs'][name] !== dir) {
				throw new Error(`The name "${name}" already exists in the global namespace`);
			}
		});
	}
};
