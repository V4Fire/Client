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
	{wrapAttrArray} = include('build/filters/helpers');

const
	elSeparatorRgxp = /^_+/;

module.exports = [
	/**
	 * Converts bem classes to a component
	 *
	 * @param {string} block
	 * @param {!Object} attrs
	 * @param {string} rootTag
	 * @param {string} value
	 * @returns {string}
	 */
	function bem2Component(block, attrs, rootTag, value) {
		const
			elName = value.replace(elSeparatorRgxp, ''),
			classes = attrs[':class'] = attrs[':class'] || [],
			styles = attrs[':style'] = attrs[':style'] || [];

		if (!$C(classes).includes('componentId')) {
			attrs[':class'] = wrapAttrArray(classes.concat('componentId', `classes && classes['${elName}']`));
		}

		attrs[':style'] = wrapAttrArray(styles.concat(`styles && styles['${elName}']`));
		return block + value;
	}
];
