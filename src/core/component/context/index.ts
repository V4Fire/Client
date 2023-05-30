/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/context/README.md]]
 * @packageDocumentation
 */

import { toRaw, wrappedContexts } from 'core/component/context/const';
import type { ComponentInterface } from 'core/component/interface';

export * from 'core/component/context/const';

/**
 * Returns a wrapped component context object based on the passed one.
 * This function is used to allow overwriting component properties and methods without hacking the original object.
 * Basically, this function returns a new object that contains the original object as a prototype.
 *
 * @param component
 */
export function getComponentContext(component: object): Dictionary & ComponentInterface['unsafe'] {
	component = toRaw in component ? component[toRaw] : component;

	let
		v = wrappedContexts.get(component);

	if (v == null) {
		v = Object.create(component);
		Object.defineProperty(v, toRaw, {value: component});
		wrappedContexts.set(component, v);
	}

	return v;
}
