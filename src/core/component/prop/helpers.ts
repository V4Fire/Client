/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentInterface } from 'core/component/interface';

/**
 * Attaches the necessary listeners for prop-attributes marked with the `forceUpdate: false` flag.
 * This is used to manage updates in a way that avoids unnecessary re-renders
 * when these particular props changes unless explicitly required.
 *
 * @param component
 */
export function attachAttrPropsListeners(component: ComponentInterface): void {
	const {
		unsafe,
		unsafe: {meta}
	} = component;

	meta.hooks['before:mounted'].push({fn: init});

	function init() {
		const parent = unsafe.$normalParent?.unsafe;

		if (parent == null) {
			return;
		}

		const propValuesToUpdate: string[][] = [];

		Object.keys(unsafe.$attrs).forEach((attrName) => {
			const propPrefix = 'on:';

			if (!attrName.startsWith(propPrefix)) {
				return;
			}

			const propName = attrName.replace(propPrefix, '');

			if (meta.props[propName] == null || meta.props[propName]?.forceUpdate === true) {
				return;
			}

			propValuesToUpdate.push([propName, attrName]);
		});

		if (propValuesToUpdate.length > 0) {
			parent.$on('hook:beforeUpdate', updatePropsValues);
			unsafe.$async.worker(() => parent.$off('hook:beforeUpdate', updatePropsValues));
		}

		function updatePropsValues() {
			propValuesToUpdate.forEach(([propName, getterName]) => {
				const getter = unsafe.$attrs[getterName];

				if (Object.isFunction(getter)) {
					unsafe[`@${propName}`] = getter()[0];
				}
			});
		}
	}
}

/**
 * Returns true if the given prop type can be a function.
 *
 * @param type
 *
 * @example
 * ```js
 * console.log(isTypeCanBeFunc(Boolean));             // false
 * console.log(isTypeCanBeFunc(Function));            // true
 * console.log(isTypeCanBeFunc([Function, Boolean])); // true
 * ```
 */
export function isTypeCanBeFunc(type: CanUndef<CanArray<Function | FunctionConstructor>>): boolean {
	if (!type) {
		return false;
	}

	if (Object.isArray(type)) {
		return type.some((type) => type === Function);
	}

	return type === Function;
}
