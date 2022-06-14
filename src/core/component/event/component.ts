/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import type { UnsafeComponentInterface } from 'core/component/interface';

import emitter from 'core/component/event/emitter';
import type { ResetType } from 'core/component/event/interface';

/**
 * Sends a message to reset all components of the application
 * @param [type] - the reset type
 */
export function reset(type?: ResetType): void {
	emitter.emit(type != null ? `reset.${type}` : 'reset');
}

/**
 * Implements event emitter API for the specified component instance
 * @param component
 */
export function implementEventEmitterAPI(component: object): void {
	/* eslint-disable @typescript-eslint/typedef */

	const
		ctx = Object.cast<UnsafeComponentInterface>(component);

	const $e = new EventEmitter({
		maxListeners: 1e3,
		newListener: false,
		wildcard: true
	});

	const
		nativeEmit = Object.cast<CanUndef<typeof ctx.$emit>>(ctx.$emit);

	Object.defineProperty(ctx, '$emit', {
		configurable: true,
		enumerable: false,
		writable: false,

		value(event, ...args) {
			nativeEmit?.(event, ...args);
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
		return function wrapper(this: unknown, e, cb) {
			const
				events = Array.concat([], e);

			for (let i = 0; i < events.length; i++) {
				$e[method](events[i], Object.cast(cb));
			}

			return this;
		};
	}

	/* eslint-enable @typescript-eslint/typedef */
}
