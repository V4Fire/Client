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
	Snakeskin = require('snakeskin'),
	path = require('upath');

module.exports = {
	/**
	 * Saves a basename of the specified directory by the passed name in the global namespace.
	 * The function should be used via the `eval` directive.
	 *
	 * @param dirName
	 * @param names
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
	saveTplDir(dirName, ...names) {
		const
			dir = path.basename(dirName);

		if (!Snakeskin.Vars['globalTplDirs']) {
			Snakeskin.Vars['globalTplDirs'] = {};
		}

		$C(names).forEach((name) => {
			if (!Snakeskin.Vars['globalTplDirs'][name]) {
				Snakeskin.Vars['globalTplDirs'][name] = dir;

			} else if (Snakeskin.Vars['globalTplDirs'][name] !== dir) {
				throw new Error(`The name "${name}" is already exist in the global namespace`);
			}
		});
	}
};
