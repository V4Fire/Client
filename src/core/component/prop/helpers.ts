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
	const {unsafe, unsafe: {meta}} = component;

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

		Object.keys(unsafe.$attrs).forEach((attrName) => {
			const prop = meta.props[attrName];

			if ((prop == null || prop.forceUpdate) && !isPropGetter.test(attrName)) {
				return;
			}

			const propPrefix = 'on:';

			if (prop != null) {
				const getterName = propPrefix + attrName;

				if (unsafe.$attrs[attrName] !== undefined && !Object.isFunction(unsafe.$attrs[getterName])) {
					throw new Error(`No accessors are defined for the prop "${attrName}". To set the accessors, pass them as ":${attrName} = propValue | @:${attrName} = createPropAccessors(() => propValue)()" or "v-attrs = {'@:${attrName}': createPropAccessors(() => propValue)}".`);
				}

			} else {
				const propName = isPropGetter.replace(attrName);

				if (meta.props[propName]?.forceUpdate === false) {
					propValuesToUpdate.push([propName, attrName]);

					if (el instanceof Element) {
						el.removeAttribute(propName);
					}
				}
			}
		});

		if (propValuesToUpdate.length > 0) {
			nonFunctionalParent.$on('hook:beforeUpdate', updatePropsValues);
			unsafe.$destructors.push(() => nonFunctionalParent.$off('hook:beforeUpdate', updatePropsValues));
		}

		async function updatePropsValues() {
			const parent = unsafe.$parent?.unsafe;

			if (parent == null) {
				return;
			}

			// For functional components, their complete mounting into the DOM is additionally awaited
			if (parent.meta.params.functional === true) {
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
