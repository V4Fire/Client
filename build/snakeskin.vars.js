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
	path = require('path');

module.exports = {
	ignore(target) {
		target.ignore = true;
		return function () {
			return target.apply(this, arguments);
		};
	},

	saveTplDir(dirName, ...names) {
		const
			dir = path.basename(dirName);

		if (!Snakeskin.Vars['globalNames']) {
			Snakeskin.Vars['globalNames'] = {};
		}

		$C(names).forEach((el) => {
			if (!Snakeskin.Vars['globalNames'][el]) {
				Snakeskin.Vars['globalNames'][el] = dir;

			} else if (Snakeskin.Vars['globalNames'][el] !== dir) {
				throw new Error(`Name ${el} is already in global namespace`);
			}
		});
	}
};
