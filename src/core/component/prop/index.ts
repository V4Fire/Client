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

import { defProp } from 'core/const/props';
import { defaultWrapper } from 'core/component/const';
import { ComponentInterface } from 'core/component/interface';
import { InitPropsObjectOptions } from 'core/component/prop/interface';

export * from 'core/component/prop/interface';

/**
 * Initializes input properties of the specified component instance.
 * The method returns an object with initialized properties.
 *
 * @param component
 * @param [opts] - additional options
 */
export function initProps(
	component: ComponentInterface,
	opts: InitPropsObjectOptions = {}
): Dictionary {
	opts.store = opts.store ?? {};

	const {
		unsafe,
		unsafe: {meta, meta: {component: {props}, params: {ssr: ssrMode}}},
		isFlyweight
	} = component;

	const
		{store, from} = opts;

	const
		// True if a component is functional or a flyweight
		isNotRegular = meta.params.functional === true || component.isFlyweight;

	for (let keys = Object.keys(props), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = props[key];

		let
			needSave = Boolean(isFlyweight) || opts.saveToStore;

		if (el == null) {
			continue;
		}

		// Don't initialize a property for a functional component unless explicitly required
		if (!ssrMode && isNotRegular && el.functional === false) {
			continue;
		}

		// @ts-ignore (access)
		unsafe['$activeField'] = key;

		let
			val = (from ?? component)[key];

		if (val === undefined) {
			val = el.default !== undefined ? el.default : Object.fastClone(meta.instance[key]);
		}

		if (val === undefined) {
			const
				obj = props[key];

			if (obj?.required) {
				throw new TypeError(`Missing the required property "${key}" (component "${component.componentName}")`);
			}
		}

		if (Object.isFunction(val)) {
			if (opts.saveToStore || val[defaultWrapper] !== true) {
				val = isTypeCanBeFunc(el.type) ? val.bind(component) : val.call(component);
				needSave = true;
			}
		}

		if (needSave) {
			if (isFlyweight) {
				const prop = val === undefined ?
					defProp :

					{
						configurable: true,
						enumerable: true,
						writable: true,
						value: val
					};

				Object.defineProperty(store, key, prop);
				component.$props[key] = val;

			} else {
				store[key] = val;
			}
		}
	}

	// @ts-ignore (access)
	unsafe['$activeField'] = undefined;
	return store;
}

/**
 * Returns true if the specified type can be a function
 *
 * @param type
 * @example
 * ```js
 * isTypeCanBeFunc(Boolean); // false
 * isTypeCanBeFunc(Function); // true
 * isTypeCanBeFunc([Function, Boolean]); // true
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
