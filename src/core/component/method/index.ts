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
 * Attaches methods to the specified component instance from its tied meta object
 * @param component
 */
export function attachMethodsFromMeta(component: ComponentInterface): void {
	const {
		meta,
		meta: {methods}
	} = component.unsafe;

	const
		ssrMode = component.$renderEngine.supports.ssr,
		isFunctional = meta.params.functional === true;

	for (let keys = Object.keys(methods), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			method = methods[key];

		if (method == null || !ssrMode && isFunctional && method.functional === false) {
			continue;
		}

		component[key] = method.fn.bind(component);
	}

	if (isFunctional) {
		component.render = Object.cast(meta.component.render);
	}
}

/**
 * Invokes the given method from the specified component instance
 *
 * @param component
 * @param method - the method name
 * @param [args] - the method arguments to invoke
 *
 * @example
 * ```js
 * // Invoke some method from the passed component
 * callMethodFromComponent(calculator, 'calc', 1, 2);
 * ```
 */
export function callMethodFromComponent(component: ComponentInterface, method: string, ...args: unknown[]): void {
	const
		obj = component.unsafe.meta.methods[method];

	if (obj != null) {
		try {
			const
				res = obj.fn.apply(component, args);

			if (Object.isPromise(res)) {
				res.catch(stderr);
			}

		} catch (err) {
			stderr(err);
		}
	}
}
