/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/prop/README.md]]
 * @packageDocumentation
 */

import { DEFAULT_WRAPPER } from 'core/component/const';

import type { ComponentInterface } from 'core/component/interface';
import type { InitPropsObjectOptions } from 'core/component/prop/interface';

export * from 'core/component/prop/interface';

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
		target = p.forceUpdate ? props : attrs;

	Object.entries(target).forEach(([name, prop]) => {
		const canSkip =
			prop == null ||
			!SSR && isFunctional && prop.functional === false;

		if (canSkip) {
			return;
		}

		unsafe.$activeField = name;

		let propValue = (from ?? component)[name];

		if (propValue === undefined) {
			propValue = prop.default !== undefined ? prop.default : Object.fastClone(meta.instance[name]);
		}

		const componentName = unsafe.componentName.camelize(false);

		if (propValue === undefined) {
			if (prop.required) {
				throw new TypeError(`Missing required prop: "${name}" at ${componentName}`);
			}

		} else if (prop.validator != null && !prop.validator(propValue)) {
			throw new TypeError(`Invalid prop: custom validator check failed for prop "${name}" at ${componentName}`);
		}

		let needSaveToStore = opts.saveToStore;

		if (Object.isFunction(propValue)) {
			if (opts.saveToStore === true || propValue[DEFAULT_WRAPPER] !== true) {
				propValue = isTypeCanBeFunc(prop.type) ? propValue.bind(component) : propValue.call(component);
				needSaveToStore = true;
			}
		}

		if (needSaveToStore) {
			Object.defineProperty(store, name, {
				configurable: true,
				enumerable: true,
				writable: false,
				value: propValue
			});
		}
	});

	unsafe.$activeField = undefined;
	return store;
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
