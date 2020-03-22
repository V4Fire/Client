/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { EventEmitter2 as EventEmitter, Listener } from 'eventemitter2';

/**
 * Adds the base event API to a component instance
 * @param component - component instance
 */
export function addEventAPI(component: object): void {
	const $e = new EventEmitter({
		maxListeners: 1e6,
		newListener: false,
		wildcard: true
	});

	Object.assign(component, {
		$emit: $e.emit.bind($e),
		$once: $e.once.bind($e),

		$on(e: CanArray<string>, cb: Listener): void {
			const
				events = (<string[]>[]).concat(e);

			for (let i = 0; i < events.length; i++) {
				$e.on(events[i], cb);
			}
		},

		$off(e: CanArray<string>, cb: Listener): void {
			const
				events = (<string[]>[]).concat(e);

			for (let i = 0; i < events.length; i++) {
				$e.off(events[i], cb);
			}
		}
	});
}
