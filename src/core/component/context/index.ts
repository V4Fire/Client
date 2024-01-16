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
	if (toRaw in component) {
		return Object.cast(component);
	}

	let
		wrappedCtx = wrappedContexts.get(component);

	if (wrappedCtx == null) {
		wrappedCtx = Object.create(component);
		saveRawComponentContext(wrappedCtx, component);
		wrappedContexts.set(component, wrappedCtx);
	}

	return wrappedCtx;
}

/**
 * Stores a reference to the "raw" component context in the main context
 *
 * @param ctx - the main context object
 * @param rawCtx - the raw context object to be stored
 */
export function saveRawComponentContext(ctx: object, rawCtx: object): void {
	Object.defineProperty(ctx, toRaw, {configurable: true, value: rawCtx});
}

/**
 * Drops a reference to the "raw" component context from the main context
 * @param ctx - the main context object
 */
export function dropRawComponentContext(ctx: object): void {
	if (toRaw in ctx) {
		wrappedContexts.delete(ctx[toRaw]);
	}

	delete ctx[toRaw];
}
