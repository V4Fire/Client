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
	{wrapAttrArray} = include('build/snakeskin/filters/helpers');

const
	elSeparatorRgxp = /^_+/;

module.exports = [
	/**
	 * Integrates BEM classes to a component: attaches identifiers, provides runtime transformers, etc.
	 *
	 * @param {string} block
	 * @param {!Object} attrs
	 * @param {string} rootTag
	 * @param {string} value
	 * @returns {string}
	 */
	function bem2Component(block, attrs, rootTag, value) {
		attrs[':class'] = attrs[':class'] || [];

		const
			elName = value.replace(elSeparatorRgxp, ''),
			classes = attrs[':class'],
			styles = attrs[':style'];

		const newClasses = classes.concat(
			$C(classes).includes('componentId') ? [] : 'componentId',
			`classes && classes['${elName}']`
		);

		attrs[':class'] = wrapAttrArray(newClasses);

		if (!styles || !styles.length) {
			attrs[':style'] = [`styles && styles['${elName}']`];
		}

		return block + value;
	}
];
