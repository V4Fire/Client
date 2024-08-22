/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { DEFAULT_WRAPPER } from 'core/component/const';
import type { ComponentInterface } from 'core/component/interface';

import { isTypeCanBeFunc } from 'core/component/prop/helpers';
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

	const {
		store,
		from
	} = p;

	const
		isFunctional = meta.params.functional === true,
		source: typeof props = p.forceUpdate ? props : attrs;

	Object.entries(source).forEach(([name, prop]) => {
		const canSkip =
			prop == null ||
			!SSR && isFunctional && prop.functional === false;

		if (canSkip) {
			return;
		}

		unsafe.$activeField = name;

		let propValue = (from ?? component)[name];

		const getAccessors = unsafe.$attrs[`on:${name}`];

		if (propValue === undefined && Object.isFunction(getAccessors)) {
			propValue = getAccessors()[0];
		}

		if (propValue === undefined) {
			if (prop.default !== undefined) {
				propValue = prop.default;

			} else {
				propValue = meta.instance[name];

				if (!Object.isPrimitive(propValue)) {
					propValue = Object.fastClone(propValue);
				}
			}
		}

		let needSaveToStore = opts.saveToStore;

		if (Object.isFunction(propValue)) {
			if (opts.saveToStore === true || propValue[DEFAULT_WRAPPER] !== true) {
				propValue = isTypeCanBeFunc(prop.type) ? propValue.bind(component) : propValue.call(component);
				needSaveToStore = true;
			}
		}

		const componentName = unsafe.componentName.camelize(false);

		if (propValue === undefined) {
			if (prop.required) {
				throw new TypeError(`Missing required prop: "${name}" at ${componentName}`);
			}

		} else if (prop.validator != null && !prop.validator(propValue)) {
			throw new TypeError(`Invalid prop: custom validator check failed for prop "${name}" at ${componentName}`);
		}

		if (needSaveToStore) {
			const privateField = `[[${name}]]`;

			if (!opts.forceUpdate) {
				// Set the property as enumerable so that it can be deleted in the destructor later
				Object.defineProperty(store, privateField, {
					configurable: true,
					enumerable: true,
					writable: true,
					value: propValue
				});
			}

			Object.defineProperty(store, name, {
				configurable: true,
				enumerable: true,
				get: () => opts.forceUpdate ? propValue : store[privateField]
			});
		}
	});

	unsafe.$activeField = undefined;
	return store;
}
