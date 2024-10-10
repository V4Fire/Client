/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { DEFAULT_WRAPPER } from 'core/component/const';

import type { ComponentInterface } from 'core/component/interface';
import type { InitPropsObjectOptions } from 'core/component/prop/interface';

/**
 * Initializes the input properties (also known as "props") for the given component instance.
 * During the initialization of a component prop, its name will be stored in the `$activeField` property.
 * The function returns a dictionary containing the initialized props.
 *
 * @param component
 * @param [opts] - additional options of initialization
 */
export function initProps(
	component: ComponentInterface,
	opts: InitPropsObjectOptions = {}
): Dictionary {
	const unsafe = Object.cast<Writable<ComponentInterface['unsafe']>>(
		component
	);

	const {
		meta,
		meta: {component: {props, attrs}}
	} = unsafe;

	const p = {
		forceUpdate: true,
		store: {},
		...opts
	};

	const {store, from} = p;

	const
		isFunctional = meta.params.functional === true,
		source: typeof props = p.forceUpdate ? props : attrs;

	const propNames = Object.keys(source);

	for (let i = 0; i < propNames.length; i++) {
		const
			propName = propNames[i],
			prop = source[propName];

		const canSkip =
			prop == null ||
			!SSR && isFunctional && prop.functional === false;

		if (canSkip) {
			continue;
		}

		unsafe.$activeField = propName;

		let propValue = (from ?? component)[propName];

		if (propValue === undefined && unsafe.getPassedHandlers?.().has(`:${propName}`)) {
			const getAccessors = unsafe.$attrs[`on:${propName}`];

			if (Object.isFunction(getAccessors)) {
				propValue = getAccessors()[0];
			}
		}

		let needSaveToStore = opts.saveToStore;

		if (propValue === undefined && prop.default !== undefined) {
			propValue = prop.default;

			if (Object.isFunction(propValue) && (opts.saveToStore === true || propValue[DEFAULT_WRAPPER] !== true)) {
				propValue = prop.type === Function ? propValue : propValue(component);

				if (Object.isFunction(propValue)) {
					propValue = propValue.bind(component);
				}

				needSaveToStore = true;
			}
		}

		const componentName = unsafe.componentName.camelize(false);

		if (propValue === undefined) {
			if (prop.required) {
				throw new TypeError(`Missing required prop: "${propName}" at ${componentName}`);
			}

		} else if (prop.validator != null && !prop.validator(propValue)) {
			throw new TypeError(`Invalid prop: custom validator check failed for prop "${propName}" at ${componentName}`);
		}

		if (needSaveToStore) {
			const privateField = `[[${propName}]]`;

			if (!opts.forceUpdate) {
				// Set the property as enumerable so that it can be deleted in the destructor later
				Object.defineProperty(store, privateField, {
					configurable: true,
					enumerable: true,
					writable: true,
					value: propValue
				});
			}

			Object.defineProperty(store, propName, {
				configurable: true,
				enumerable: true,
				get: () => opts.forceUpdate ? propValue : store[privateField]
			});
		}
	}

	unsafe.$activeField = undefined;
	return store;
}
