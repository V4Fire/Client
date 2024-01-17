/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { EventId } from 'core/async';

import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import type { UnsafeComponentInterface } from 'core/component/interface';

import { globalEmitter } from 'core/component/event/emitter';
import type { ComponentResetType } from 'core/component/event/interface';

/**
 * The directive emits a special event to completely destroy the entire application by its root component's identifier.
 * This method is typically used in conjunction with SSR.
 *
 * @param appId - the unique application identifier
 */
export function destroyApp(appId: string): void {
	globalEmitter.emit(`destroy.${appId}`);
}

/**
 * Emits a special event to reset components' state to its default settings.
 * By default, this event triggers a complete reload of all providers and storages bound to components.
 * Additionally, you can choose from several types of component resets:
 *
 * @param [type] - reset type:
 *   1. `'load'` - reloads all data providers bound to components;
 *   2. `'load.silence'` - reloads all data providers bound to components without changing
 *      components' statuses to `loading`;
 *
 *   3. `'router'` - resets all components' bindings to the application router;
 *   4. `'router.silence'` - resets all components' bindings to the application router without
 *      changing components' statuses to `loading`;
 *
 *   5. `'storage'` - reloads all storages bound to components;
 *   6. `'storage.silence'` - reload all storages bound to components without
 *       changing components' statuses to `loading`;
 *
 *   7. `'silence'` - reloads all providers and storages bound to components without
 *      changing components' statuses to `loading`.
 */
export function resetComponents(type?: ComponentResetType): void {
	globalEmitter.emit(type != null ? `reset.${type}` : 'reset');
}

/**
 * Implements the event emitter interface for a given component.
 * The interface includes methods such as `on`, `once`, `off`, and `emit`.
 * All event handlers are proxied by a component internal [[Async]] instance.
 *
 * @param component
 */
export function implementEventEmitterAPI(component: object): void {
	const
		ctx = Object.cast<UnsafeComponentInterface>(component);

	const $e = ctx.$async.wrapEventEmitter(new EventEmitter({
		maxListeners: 1e3,
		newListener: false,
		wildcard: true
	}));

	const
		nativeEmit = Object.cast<CanUndef<typeof ctx.$emit>>(ctx.$emit);

	Object.defineProperty(ctx, '$emit', {
		configurable: true,
		enumerable: false,
		writable: false,

		value(event: string, ...args: unknown[]) {
			if (!event.startsWith('[[')) {
				nativeEmit?.(event, ...args);
			}

			$e.emit(event, ...args);
			return this;
		}
	});

	Object.defineProperty(ctx, '$on', {
		configurable: true,
		enumerable: false,
		writable: false,
		value: getMethod('on')
	});

	Object.defineProperty(ctx, '$once', {
		configurable: true,
		enumerable: false,
		writable: false,
		value: getMethod('once')
	});

	Object.defineProperty(ctx, '$off', {
		configurable: true,
		enumerable: false,
		writable: false,
		value: getMethod('off')
	});

	function getMethod(method: 'on' | 'once' | 'off') {
		return function wrapper(this: unknown, event: CanArray<string>, cb?: Function) {
			const
				links: EventId[] = [],
				isOnLike = method !== 'off';

			Array.concat([], event).forEach((event) => {
				if (method === 'off' && cb == null) {
					$e.removeAllListeners(event);

				} else {
					const link = $e[method](Object.cast(event), Object.cast(cb));

					if (isOnLike) {
						links.push(Object.cast(link));
					}
				}
			});

			if (isOnLike) {
				return Object.isArray(event) ? links : links[0];
			}

			return this;
		};
	}
}
