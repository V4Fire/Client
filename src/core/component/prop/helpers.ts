/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { isPropGetter } from 'core/component/reflect';
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

	if (unsafe.meta.params.functional === true) {
		return;
	}

	meta.hooks['before:mounted'].push({fn: init});

	function init() {
		const nonFunctionalParent = unsafe.$normalParent?.unsafe;

		if (nonFunctionalParent == null) {
			return;
		}

		const
			el = unsafe.$el,
			propValuesToUpdate: string[][] = [];

		Object.entries(unsafe.$attrs).forEach(([attrName, attrVal]) => {
			const propPrefix = 'on:';

			if (meta.props[attrName]?.forceUpdate === false) {
				const getterName = propPrefix + attrName;

				if (attrVal !== undefined && !Object.isFunction(unsafe.$attrs[getterName])) {
					throw new Error(`No accessors are defined for the prop "${attrName}". To set the accessors, pass them as ":${attrName} = propValue | @:${attrName} = createPropAccessors(() => propValue)()" or "v-attrs = {'@:${attrName}': createPropAccessors(() => propValue)}".`);
				}
			}

			if (!isPropGetter.test(attrName)) {
				return;
			}

			const propName = isPropGetter.replace(attrName);

			if (meta.props[propName]?.forceUpdate === false) {
				propValuesToUpdate.push([propName, attrName]);

				if (el instanceof Element) {
					el.removeAttribute(propName);
				}
			}
		});

		if (propValuesToUpdate.length > 0) {
			nonFunctionalParent.$on('hook:beforeUpdate', updatePropsValues);
			unsafe.$async.worker(() => nonFunctionalParent.$off('hook:beforeUpdate', updatePropsValues));
		}

		async function updatePropsValues() {
			const parent = unsafe.$parent?.unsafe;

			if (parent == null) {
				return;
			}

			// For functional components, their complete mounting into the DOM is additionally awaited
			if (parent.isFunctional === true) {
				await parent.$nextTick();
			}

			propValuesToUpdate.forEach(([propName, getterName]) => {
				const getter = unsafe.$attrs[getterName];

				if (Object.isFunction(getter)) {
					unsafe[`[[${propName}]]`] = getter()[0];
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
