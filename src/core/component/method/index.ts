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

import type { ComponentInterface } from 'core/component/interface';

/**
 * Attaches methods to the passed component instance, taken from its associated metaobject
 * @param component
 */
export function attachMethodsFromMeta(component: ComponentInterface): void {
	const {meta, meta: {methods}} = component.unsafe;

	const isFunctional = meta.params.functional === true;

	for (const [name, method] of methods) {
		if (!SSR && isFunctional && method.functional === false) {
			continue;
		}

		component[name] = method.fn.bind(component);
	}

	if (isFunctional) {
		component.render = Object.cast(meta.component.render);
	}
}

/**
 * Invokes a specific method from the passed component instance
 *
 * @param component
 * @param methodName - the method name
 * @param [args] - the method arguments to invoke
 *
 * @example
 * ```js
 * // Invoke the `calc` method from the passed component
 * callMethodFromComponent(calculator, 'calc', 1, 2);
 * ```
 */
export function callMethodFromComponent(component: ComponentInterface, methodName: string, ...args: unknown[]): void {
	const method = component.unsafe.meta.methods.get(methodName);

	let res: unknown;

	if (method != null) {
		switch (args.length) {
			case 0:
				res = method.fn.call(component);
				break;

			case 1:
				res = method.fn.call(component, args[0]);
				break;

			case 2:
				res = method.fn.call(component, args[0], args[1]);
				break;

			default:
				res = method.fn.apply(component, args);
		}

		if (Object.isPromise(res)) {
			res.catch(stderr);
		}
	}
}
