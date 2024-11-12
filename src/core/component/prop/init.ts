/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

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

	const
		propNames = Object.keys(source),
		passedProps = unsafe.getPassedProps?.();

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

		const
			accessorName = `on:${propName}`,
			getAccessors = unsafe.$attrs[accessorName];

		if (propValue === undefined && Object.isFunction(getAccessors)) {
			propValue = getAccessors()[0];
		}

		let needSaveToStore = opts.saveToStore;

		if (propValue === undefined && prop.default !== undefined) {
			propValue = prop.default;

			if (Object.isFunction(propValue) && opts.saveToStore) {
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

			if (!opts.forceUpdate && passedProps?.hasOwnProperty(accessorName)) {
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
				get: () => !opts.forceUpdate && privateField in store ? store[privateField] : propValue
			});
		}
	}

	unsafe.$activeField = undefined;
	return store;
}
