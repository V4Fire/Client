/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	{webpack} = require('@config/config');

module.exports = [
	/**
	 * Integrates BEM classes to components: attaches identifiers, provides runtime transformers, etc.
	 *
	 * @param {string} block - a name of the active BEM block
	 * @param {object} attrs - a dictionary with attributes of the node to which the filter is applied
	 * @param {string} rootTag - a type of the component root tag within which the directive is applied
	 * @param {string} element - a name of the BEM element to create, with a prefix
	 * @returns {string}
	 */
	function bem2Component(block, attrs, rootTag, element) {
		const
			elId = 'data-cached-class-component-id',
			elName = element.replace(/^_+/, '');

		if (webpack.ssr) {
			attrs[`:${elId}`] = ['String(renderComponentId)'];

		} else {
			attrs[elId] = [true];
		}

		const provide = 'data-cached-class-provided-classes-styles';
		attrs[provide] = Array.concat([], attrs[provide], elName);

		return block + element;
	}
];
