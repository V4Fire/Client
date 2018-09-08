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
	{attachClass} = include('build/filters/helpers');

const
	elSeparatorRgxp = /^_+/;

module.exports = [
	/**
	 * Converts bem classes to Vue
	 *
	 * @param {string} block
	 * @param {!Object} attrs
	 * @param {string} rootTag
	 * @param {string} value
	 * @returns {string}
	 */
	function bem2Vue(block, attrs, rootTag, value) {
		const
			tmp = attrs[':class'] = attrs[':class'] || [];

		if (!$C(tmp).includes('componentId')) {
			attrs[':class'] = attachClass(tmp.concat('componentId', `classes['${value.replace(elSeparatorRgxp, '')}']`));
		}

		return block + value;
	}
];
