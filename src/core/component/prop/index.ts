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
	opts.store = opts.store ?? {};

	const unsafe = Object.cast<Writable<ComponentInterface['unsafe']>>(
		component
	);

	const
		{meta, meta: {component: {props}}} = unsafe,
		{store, from} = opts;

	const
		isFunctional = meta.params.functional === true;

	Object.entries(props).forEach(([name, prop]) => {
		if (prop == null || !SSR && isFunctional && prop.functional === false) {
			return;
		}

		unsafe.$activeField = name;

		let
			val = (from ?? component)[name];

		if (val === undefined) {
			val = prop.default !== undefined ? prop.default : Object.fastClone(meta.instance[name]);
		}

		if (val === undefined) {
			const
				obj = props[name];

			if (obj?.required) {
				throw new TypeError(`Missing the required property "${name}" of the "${component.componentName}" component`);
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
			store[name] = val;
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
		for (let i = 0; i < type.length; i++) {
			if (type[i] === Function) {
				return true;
			}
		}

		return false;
	}

	return type === Function;
}
