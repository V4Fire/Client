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
	event = new EventEmitter({maxListeners: 1e3, newListener: false});

/**
 * Saves the specified ABT options
 * @param opts
 */
export default async function saveABT(opts: unknown): Promise<void> {
	let
		config = adapter(opts);

	if (Object.isPromise(config)) {
		config = await config.catch(stderr) || [];
	}

	if (Object.isArray(config)) {
		if (!Object.fastCompare(state.experiments, config)) {
			state.experiments = config;
			event.emit('set', config);
		}

	} else {
		state.experiments = [];
		event.emit('clear', config);
	}
}
