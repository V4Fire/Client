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
 * This function allows developers to override component properties and methods without altering the original object.
 * Essentially, override creates a new object that contains the original object as its prototype,
 * allowing for the addition, modification, or removal of properties and methods without affecting the original object.
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
