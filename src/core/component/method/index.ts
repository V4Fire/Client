/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/method/README.md]]
 * @packageDocumentation
 */

import type { ComponentInterface, UnsafeComponentInterface } from 'core/component/interface';

/**
 * Attaches methods to the passed component instance, taken from its associated metaobject
 * @param component
 */
export function attachMethodsFromMeta(component: ComponentInterface): void {
	const {meta, meta: {component: {methods}}} = Object.cast<UnsafeComponentInterface>(component);

	const methodNames = Object.keys(methods);

	for (let i = 0; i < methodNames.length; i++) {
		const
			methodName = methodNames[i],
			method = methods[methodName];

		if (method == null) {
			continue;
		}

		component[methodName] = method.bind(component);
	}

	if (meta.params.functional === true) {
		component.render = Object.cast(meta.component.render);
	}
}

/**
 * Invokes a specific method from the passed component instance
 *
 * @param component
 * @param method - the method name
 * @param [args] - the method arguments to invoke
 *
 * @example
 * ```js
 * // Invoke the `calc` method from the passed component
 * callMethodFromComponent(calculator, 'calc', 1, 2);
 * ```
 */
export function callMethodFromComponent(component: ComponentInterface, method: string, ...args: unknown[]): void {
	const obj = component.unsafe.meta.methods[method];

	if (obj != null) {
		const res = obj.fn.apply(component, args);

		if (Object.isPromise(res)) {
			res.catch(stderr);
		}
	}
}
