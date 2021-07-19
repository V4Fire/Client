/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { EventEmitter2 as EventEmitter, ListenerFn, OnOptions } from 'eventemitter2';
import { componentParams } from 'core/component/const/cache';

/**
 * Event emitter to broadcast component initialize events
 */
export const
	initEmitter = new EventEmitter({maxListeners: 1e3, newListener: false});

// We need wrap an original "once" function of the emitter
// to attach logic to register smart components
((initEventOnce) => {
	initEmitter.once = function once(
		event: CanArray<string>,
		listener: ListenerFn,
		opts?: true | OnOptions
	): EventEmitter {
		const
			events = Array.concat([], event);

		for (let i = 0; i < events.length; i++) {
			const
				el = events[i],
				chunks = el.split('.', 2);

			if (chunks[0] === 'constructor') {
				initEventOnce(el, listener, opts);

				const
					p = componentParams.get(chunks[1]);

				if (p && Object.isPlainObject(p.functional)) {
					initEventOnce(`${el}-functional`, listener, opts);
				}

			} else {
				initEventOnce(el, listener, opts);
			}
		}

		return this;
	};
})(initEmitter.once.bind(initEmitter));
