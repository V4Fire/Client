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
 * This event emitter is used to broadcast various external events from modules to a unified event bus for components
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
 * This event emitter is used to broadcast components' initialization events
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
		(Object.isArray(event) ? event : [event]).forEach((event) => {
			const chunks = event.split('.', 2);

			if (chunks[0] === 'constructor') {
				initEventOnce(event, listener, opts);

				const p = componentParams.get(chunks[1]);

				if (p != null && Object.isDictionary(p.functional)) {
					initEventOnce(`${event}-functional`, listener, opts);
				}

			} else {
				initEventOnce(event, listener, opts);
			}
		});

		return this;
	};
})(initEmitter.once.bind(initEmitter));
