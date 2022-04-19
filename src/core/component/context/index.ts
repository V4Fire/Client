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

import { toRaw, ctxMap } from 'core/component/context/const';
import type { ComponentInterface } from 'core/component/interface';

export * from 'core/component/context/const';

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
