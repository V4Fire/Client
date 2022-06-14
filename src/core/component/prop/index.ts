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
 * Initializes input properties (aka "props") of the passed component instance.
 * While a component prop is being initialized, its name will be stored in the `$activeField` property.
 * The function returns a dictionary with the initialized props.
 *
 * @param component
 * @param [opts] - additional options of initialization
 */
export function initProps(
	component: ComponentInterface,
	opts: InitPropsObjectOptions = {}
): Dictionary {
	opts.store = opts.store ?? {};

	const unsafe = Object.cast<Writable<ComponentInterface['unsafe']>>(
		component
	);

	const {
		meta,
		meta: {component: {props}}
	} = unsafe;

	const
		{store, from} = opts;

	const
		ssrMode = component.$renderEngine.supports.ssr,
		isFunctional = meta.params.functional === true;

	for (let keys = Object.keys(props), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			prop = props[key];

		if (prop == null || !ssrMode && isFunctional && prop.functional === false) {
			continue;
		}

		unsafe.$activeField = key;

		let
			val = (from ?? component)[key];

		if (val === undefined) {
			val = prop.default !== undefined ? prop.default : Object.fastClone(meta.instance[key]);
		}

		if (val === undefined) {
			const
				obj = props[key];

			if (obj?.required) {
				throw new TypeError(`Missing the required property "${key}" of the "${component.componentName}" component`);
			}
		}

		let
			needSaveToStore = opts.saveToStore;

		if (Object.isFunction(val)) {
			if (opts.saveToStore || val[DEFAULT_WRAPPER] !== true) {
				val = isTypeCanBeFunc(prop.type) ? val.bind(component) : val.call(component);
				needSaveToStore = true;
			}
		}

		if (needSaveToStore) {
			store[key] = val;
		}
	}

	unsafe.$activeField = undefined;
	return store;
}

/**
 * Returns true if the specified prop type can be a function
 *
 * @param type
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
		for (let i = 0; i < type.length; i++) {
			if (type[i] === Function) {
				return true;
			}
		}

		return false;
	}

	return type === Function;
}
