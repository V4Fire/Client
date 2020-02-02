/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { EventEmitter2 as EventEmitter, Listener } from 'eventemitter2';
import { componentParams } from 'core/component/const/cache';

/**
 * Event emitter to broadcast component initialize events
 */
export const
	initEmitter = new EventEmitter({maxListeners: 1e3, newListener: false});

((initEventOnce) => {
	initEmitter.once = function (event: CanArray<string>, listener: Listener): EventEmitter {
		const
			events = (<string[]>[]).concat(event);

		for (let i = 0; i < events.length; i++) {
			const
				el = events[i],
				chunks = el.split('.');

			if (chunks[0] === 'constructor') {
				initEventOnce(el, listener);

				const
					p = componentParams.get(chunks[1]);

				if (p && Object.isPlainObject(p.functional)) {
					initEventOnce(`${el}-functional`, listener);
				}

			} else {
				initEventOnce(el, listener);
			}
		}

		return this;
	};
})(initEmitter.once.bind(initEmitter));
