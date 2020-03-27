/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentInterface } from 'core/component';

/**
 * [[include:core/component/method/README.md]]
 * @packageDocumentation
 */

/**
 * Invokes a method from the specified component instance
 *
 * @param component
 * @param method - method name
 * @param [args] - method arguments
 */
export function callMethodFromComponent(component: ComponentInterface, method: string, ...args: unknown[]): void {
	const
		// @ts-ignore (access)
		obj = component.meta.methods[method];

	if (obj) {
		try {
			const
				res = obj.fn.apply(component, args);

			if (res instanceof Promise) {
				res.catch(stderr);
			}

		} catch (err) {
			stderr(err);
		}
	}
}

/**
 * Attaches methods from a meta object to the specified component instance
 * @param component
 */
export function attachMethodsFromMeta(component: ComponentInterface): void {
	const
		// @ts-ignore (access)
		{meta, meta: {methods}} = component,
		isFlyweight = component.$isFlyweight || meta.params.functional === true;

	for (let keys = Object.keys(methods), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = methods[key];

		if (!el) {
			continue;
		}

		if (isFlyweight && el.functional === false) {
			continue;
		}

		component[key] = el.fn.bind(component);
	}
}
