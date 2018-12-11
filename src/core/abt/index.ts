/*!
 * V4Fire Core
 * https://github.com/V4Fire/Core
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Core/blob/master/LICENSE
 */

import state from 'core/component/state';
import adapter from 'core/abt/engines';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

export const
	event = new EventEmitter({maxListeners: 100});

export default function saveABT(options: unknown): void {
	const
		config = adapter(options);

	if (Object.isArray(config)) {
		state.experiments = config;
		event.emit('set', config);

	} else {
		throw new Error('Wrong format for an ABT config');
	}
}
