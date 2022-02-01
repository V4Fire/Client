/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import type { UnsafeComponentInterface } from 'core/component/interface';

/**
 * Implements the base event API to a component instance
 * @param obj
 */
export function implementEventAPI(obj: object): void {
	/* eslint-disable @typescript-eslint/typedef */

	const
		component = Object.cast<UnsafeComponentInterface>(obj);

	const $e = new EventEmitter({
		maxListeners: 1e3,
		newListener: false,
		wildcard: true
	});

	const
		nativeEmit = Object.cast<CanUndef<typeof component.$emit>>(component.$emit);

	Object.defineProperty(component, '$emit', {
		configurable: true,
		enumerable: false,
		writable: false,

		value(event, ...args) {
			nativeEmit?.(event, ...args);
			$e.emit(event, ...args);
			return this;
		}
	});

	Object.defineProperty(component, '$on', {
		configurable: true,
		enumerable: false,
		writable: false,
		value: getMethod('on')
	});

	Object.defineProperty(component, '$once', {
		configurable: true,
		enumerable: false,
		writable: false,
		value: getMethod('once')
	});

	Object.defineProperty(component, '$off', {
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
