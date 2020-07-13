'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	Snakeskin = require('snakeskin'),
	Typograf = require('typograf');

const
	config = require('config');

const
	tp = new Typograf(config.typograf());

Snakeskin.importFilters({
	/**
	 * Applies Typograf to the specified string and returns it
	 *
	 * @param {string} str
	 * @returns {string}
	 */
	typograf(str) {
		return tp.execute(str);
	}
});
