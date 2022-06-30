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

module.exports = [
	/**
	 * Integrates BEM classes to components: attaches identifiers, provides runtime transformers, etc.
	 *
	 * @param {string} block - a name of the active BEM block
	 * @param {!Object} attrs - a dictionary with attributes of the node to which the filter is applied
	 * @param {string} rootTag - a type of the component root tag within which the directive is applied
	 * @param {string} element - a name of the BEM element to create, with a prefix
	 * @returns {string}
	 */
	function bem2Component(block, attrs, rootTag, element) {
		attrs['data-cached-class-component-id'] = wrapAttrArray([true]);

		attrs['data-cached-class-provided-classes-styles'] = wrapAttrArray(
			[element.replace(/^_+/, '')]
		);

		return block + element;
	}
];
