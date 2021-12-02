/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentInterface } from '~/core/component';

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

/**
 * Attaches methods from a meta object to the specified component instance
 * @param component
 */
export function attachMethodsFromMeta(component: ComponentInterface): void {
	const {
		unsafe: {
			meta,
			meta: {methods}
		}
	} = component;

	const
		ssrMode = component.$renderEngine.supports.ssr,
		isNotRegular = meta.params.functional === true || component.isFlyweight;

	for (let keys = Object.keys(methods), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = methods[key];

		if (!el) {
			continue;
		}

		if (!ssrMode && isNotRegular && el.functional === false) {
			continue;
		}

		component[key] = el.fn.bind(component);
	}
}
