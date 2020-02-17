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
import { ComponentInterface, PropOptions } from 'core/component/interface';
import { InitPropsObjectOptions } from 'core/component/prop/interface';
export * from 'core/component/prop/interface';

/**
 * Initializes the specified input properties to a component context.
 * The method returns an object with initialized properties.
 *
 * @param props - component input properties
 * @param ctx - component context
 * @param [opts] - additional options
 */
export function initProps(
	props: Dictionary<PropOptions>,
	ctx: ComponentInterface,
	opts: InitPropsObjectOptions = {}
): Dictionary {
	const
		// @ts-ignore (access)
		{meta, meta: {component, instance}} = ctx;

	const
		store = opts.store = opts.store || {},

		// True if a component is functional or flyweight (composite)
		isFlyweight = ctx.$isFlyweight || meta.params.functional === true;

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
		ctx.$activeField = key;

		let
			val = ctx[key];

		if (val === undefined) {
			val = el.default !== undefined ? el.default : Object.fastClone(instance[key]);
		}

		if (val === undefined) {
			const
				obj = component.props[key];

			if (obj && obj.required) {
				throw new TypeError(`Missing the required property "${key}" (component "${ctx.componentName}")`);
			}
		}

		if (Object.isFunction(val)) {
			if (opts.saveToStore || !val[defaultWrapper]) {
				store[key] = isTypeCanBeFunc(el.type) ? val.bind(ctx) : val.call(ctx);
			}

		} else if (opts.saveToStore) {
			store[key] = val;
		}
	}

	// @ts-ignore (access)
	ctx.$activeField = undefined;
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
