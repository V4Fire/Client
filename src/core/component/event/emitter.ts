/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import log from 'core/log';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

/**
 * Event emitter to broadcast external events to components
 */
const emitter = new EventEmitter({
	maxListeners: 1e3,
	newListener: false,
	wildcard: true
});

const
	originalEmit = emitter.emit.bind(emitter);

emitter.emit = (event: string, ...args) => {
	const res = originalEmit(event, ...args);
	log(`global:event:${event.replace(/\./g, ':')}`, ...args);
	return res;
};

export default emitter;
