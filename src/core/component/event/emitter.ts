/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import {

	EventEmitter2 as EventEmitter,

	OnOptions,
	ListenerFn

} from 'eventemitter2';

import log from 'core/log';
import { componentParams } from 'core/component/const';

/**
 * The event emitter to broadcast external events to components
 */
export const globalEmitter = new EventEmitter({
	maxListeners: 1e3,
	newListener: false,
	wildcard: true
});

const
	originalEmit = globalEmitter.emit.bind(globalEmitter);

globalEmitter.emit = (event: string, ...args) => {
	const res = originalEmit(event, ...args);
	log(`global:event:${event.replace(/\./g, ':')}`, ...args);
	return res;
};

/**
 * The event emitter to broadcast component initialization events
 */
export const initEmitter = new EventEmitter({
	maxListeners: 1e3,
	newListener: false
});

// We need to wrap the original `once` function of the emitter
// to attach logic of registering smart components
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

