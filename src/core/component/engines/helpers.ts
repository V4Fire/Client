/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentInterface } from 'core/component';

const
	toRaw = Symbol('Link to a RAW component'),
	ctxMap = new WeakMap();

/**
 * Returns a component context object by the specified component instance
 * @param component
 */
export function getComponentContext(component: object): Dictionary & ComponentInterface['unsafe'] {
	component = component[toRaw] ?? component;

	let
		v = ctxMap.get(component);

	if (v == null) {
		v = Object.create(component);
		Object.defineProperty(v, toRaw, {value: component});
		ctxMap.set(component, v);
	}

	return v;
}
