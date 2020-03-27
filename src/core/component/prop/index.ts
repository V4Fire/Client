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
	const
		// @ts-ignore (access)
		{meta, meta: {component: {props}}} = component;

	const
		store = opts.store = opts.store || {},

		// True if a component is functional or flyweight (composite)
		isFlyweight = component.$isFlyweight || meta.params.functional === true;

	for (let keys = Object.keys(props), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = props[key];

		if (!el) {
			continue;
		}

		// Don't initialize a property for a functional component
		// unless explicitly required (functional == false)
		if (isFlyweight && el.functional === false) {
			continue;
		}

		// @ts-ignore (access)
		component.$activeField = key;

		let
			val = component[key];

		if (val === undefined) {
			val = el.default !== undefined ? el.default : Object.fastClone(meta.instance[key]);
		}

		if (val === undefined) {
			const
				obj = props[key];

			if (obj && obj.required) {
				throw new TypeError(`Missing the required property "${key}" (component "${component.componentName}")`);
			}
		}

		if (Object.isFunction(val)) {
			if (opts.saveToStore || !val[defaultWrapper]) {
				store[key] = isTypeCanBeFunc(el.type) ? val.bind(component) : val.call(component);
			}

		} else if (opts.saveToStore) {
			store[key] = val;
		}
	}

	// @ts-ignore (access)
	component.$activeField = undefined;
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
export function isTypeCanBeFunc(type: CanUndef<CanArray<Function>>): boolean {
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
