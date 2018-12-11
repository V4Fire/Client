/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import adapter from 'core/abt/engines';
import state from 'core/component/state';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

export const
	event = new EventEmitter({maxListeners: 100});

export default function saveABT(options: unknown): void {
	const
		config = adapter(options);

	if (Object.isArray(config)) {
		state.experiments = config;
		event.emit('set', config);
	}
}
