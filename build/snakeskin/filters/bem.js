'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
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
		attrs['data-cached-class-component-id'] = wrapAttrArray([true]);
		attrs['data-cached-class-provided-classes-styles'] = wrapAttrArray([value.replace(elSeparatorRgxp, '')]);
		return block + value;
	}
];
