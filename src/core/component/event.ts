/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import log from 'core/log';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

const event = new EventEmitter({
	maxListeners: 1e3,
	wildcard: true
});

export type ResetType =
	'load' |
	'router' |
	'storage';

/**
 * Sends a message for reset to all components
 * @param [type] - reset type
 */
export function reset(type?: ResetType): void {
	event.emit(type ? `reset.${type}` : 'reset');
	log(`global:event:${type}`);
}

export default event;
