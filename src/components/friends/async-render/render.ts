/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { restart, deferRestart } from 'core/component/render/daemon';

import type Friend from 'components/friends/friend';

/**
 * Restarts the asyncRender daemon to enforce the rendering of asynchronous chunks
 * @see core/component/render/daemon
 */
export function forceRender(this: Friend): void {
	restart();
	this.localEmitter.emit('forceRender');
}

/**
 * Schedules a task to restart the asyncRender daemon on the next tick
 *
 * @see forceRender
 * @see core/component/render/daemon
 */
export function deferForceRender(this: Friend): void {
	deferRestart();
	this.localEmitter.emit('forceRender');
}

/**
 * A factory to create filters for AsyncRender; it returns a new function.
 * This new function can return either a boolean or a promise.
 * If the function returns a promise, it will be resolved after a forceRender event is triggered.
 *
 * The main function can accept an element name as the first parameter.
 * This element will be removed before the returned promise is resolved.
 *
 * Note that the initial component rendering is equivalent to a forceRender event.
 * This function is useful for re-rendering a functional component without altering the parent state.
 *
 * @param elementToDrop - an element to be dropped before the promise is resolved
 * (if the element is passed as a function, it will be invoked)
 *
 * @example
 * ```
 * < button @click = asyncRender.forceRender()
 *   Re-render the component
 *
 * < .container v-async-target
 *   < .&__item v-for = el in asyncRender.iterate(true, {filter: asyncRender.waitForceRender('content')})
 *     < .&__content
 *       {{ Math.random() }}
 * ```
 */
export function waitForceRender(
	this: Friend,
	elementToDrop?: string | ((ctx: Friend['component']) => CanPromise<CanUndef<string | Element>>)
): () => CanPromise<boolean> {
	return () => {
		if (this.ctx.$renderCounter === 0) {
			return true;
		}

		return this.localEmitter.promisifyOnce('forceRender').then(async () => {
			if (elementToDrop != null) {
				let
					el: Nullable<string | Element>;

				if (Object.isFunction(elementToDrop)) {
					el = await elementToDrop(this.component);

				} else {
					el = elementToDrop;
				}

				if (Object.isString(el)) {
					this.block?.element(el)?.remove();

				} else {
					el?.remove();
				}
			}

			return true;
		});
	};
}
