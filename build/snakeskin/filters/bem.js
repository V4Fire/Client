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

const
	visited = Symbol('visited');

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
			elName = element.replace(/^_+/, '');

		// We add a class with componentId to each BEM element of our component.
		// This is necessary for quickly locating such elements in the markup and avoiding problems with
		// recursive components (where the class name of the element alone is not sufficient).
		//
		// Also, we have special props for passing classes and
		// styles to specific component elements from an external component.
		// For example,
		//
		// ```
		// <b-example :classes="provide.classes({button: 'example'})" :styles="{button: 'color: red'}">
		// ```
		//
		// Here, we have passed a new external CSS class and external styles to the button element.

		// Explicitly set the necessary attributes for the most efficient template compilation under SSR
		if (webpack.ssr) {
			const
				provideClasses = `('classes' in self && classes?.['${elName}']) ?? []`,
				provideStyles = `('styles' in self && styles?.['${elName}']) ?? []`;

			if (attrs[visited]) {
				attrs[':class'] = [`${attrs[':class'][0]}.concat(${provideClasses})`];
				attrs[':style'] = [`${attrs[':style'][0]}.concat(${provideStyles})`];

			} else {
				attrs[visited] = true;

				if (attrs[':class']) {
					attrs[':class'] = [`[].concat((${attrs[':class'][0]}), renderComponentId ? componentId : "", ${provideClasses})`];

				} else {
					attrs[':class'] = [`[].concat(renderComponentId ? componentId : [], ${provideClasses})`];
				}

				if (attrs[':style']) {
					attrs[':style'] = [`[].concat((${attrs[':style'][0]}), ${provideStyles})`];

				} else {
					attrs[':style'] = [`[].concat(${provideStyles})`];
				}
			}

		// For client-side rendering, we set these values through a static data attribute,
		// which will be expanded in the module `core/component/render/helpers/attrs.ts`.
		// The issue is that if we simply insert the values explicitly,
		// the template compilation won't be able to cache nodes with these parameters,
		// even though the componentId and external classes/styles cannot change.
		// Therefore, we use a special static attribute and later expand it in the transformer.
		} else {
			attrs['data-cached-class-component-id'] = [true];

			const provide = 'data-cached-class-provided-classes-styles';
			attrs[provide] = Array.concat([], attrs[provide], elName);
		}

		return block + element;
	}
];
