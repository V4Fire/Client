/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { EventEmitter2 as EventEmitter } from 'eventemitter2';

/**
 * Event emitter to broadcast ABT events
 */
export const
	emitter = new EventEmitter({maxListeners: 1e3, newListener: false});

/**
 * @deprecated
 * @see [[emitter]]
 */
export const
	event = emitter;
