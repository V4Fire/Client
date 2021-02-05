/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { EventEmitter2 as EventEmitter, ListenerFn } from 'eventemitter2';

/**
 * Implements the base event API to a component instance
 * @param component
 */
export function implementEventAPI(component: object): void {
	const $e = new EventEmitter({
		maxListeners: 1e6,
		newListener: false,
		wildcard: true
	});

	// @ts-ignore (access)
	component.$emit = $e.emit.bind($e);

	// @ts-ignore (access)
	component.$once = $e.once.bind($e);

	// @ts-ignore (access)
	component.$on = function $on(e: CanArray<string>, cb: ListenerFn): void {
		const
			events = Array.concat([], e);

		for (let i = 0; i < events.length; i++) {
			$e.on(events[i], cb);
		}
	};

	// @ts-ignore (access)
	component.$off = function $off(e: CanArray<string>, cb: ListenerFn): void {
		const
			events = Array.concat([], e);

		for (let i = 0; i < events.length; i++) {
			$e.off(events[i], cb);
		}
	};
}
