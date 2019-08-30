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

		const newClasses = classes.concat(
			$C(classes).includes('componentId') ? [] : 'componentId',
			`classes && classes['${elName}']`
		);

		attrs[':class'] = wrapAttrArray(newClasses);
		attrs[':style'] = wrapAttrArray(styles.concat(`styles && styles['${elName}']`));

		return block + value;
	}
];
