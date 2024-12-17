/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import log from 'core/log';

/**
 * This event emitter is used to broadcast various external events from modules to a unified event bus for components
 */
export const globalEmitter = new EventEmitter({
	maxListeners: 1e3,
	newListener: false,
	wildcard: true
});

const originalEmit = globalEmitter.emit.bind(globalEmitter);

globalEmitter.emit = (event: string, ...args) => {
	const res = originalEmit(event, ...args);
	log(`global:event:${event.replaceAll('.', ':')}`, ...args);
	return res;
};

/**
 * This event emitter is used to broadcast components' initialization events
 */
export const initEmitter = new EventEmitter({
	maxListeners: 1e3,
	newListener: false
});
