/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	config = require('@config/config');

const
	Snakeskin = require('snakeskin'),
	Typograf = require('typograf');

let tp;

if (Typograf.hasLocale(config.typograf().locale)) {
	tp = new Typograf(config.typograf());
}

Snakeskin.importFilters({
	/**
	 * Applies Typograf to the specified string and returns the result
	 *
	 * @param {string} str
	 * @returns {string}
	 */
	typograf(str) {
		return tp ? tp.execute(str) : str;
	}
});
