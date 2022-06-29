'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const path = require('upath');

/** @type {!Object} */
const {Vars} = require('snakeskin');

module.exports = {
	/**
	 * Saves a basename of the specified dirname to the global namespace by the passed aliases.
	 * The function should be used via the `eval` directive.
	 *
	 * @param dirname
	 * @param aliases
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
		const
			dir = path.basename(dirname);

		if (!Vars['globalTplDirs']) {
			Vars['globalTplDirs'] = {};
		}

		Object.forEach(aliases, (name) => {
			if (!Vars['globalTplDirs'][name]) {
				Vars['globalTplDirs'][name] = dir;

			} else if (Vars['globalTplDirs'][name] !== dir) {
				throw new Error(`The name "${name}" is already exist in the global namespace`);
			}
		});
	}
};
