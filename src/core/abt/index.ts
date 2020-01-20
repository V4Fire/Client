/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/abt/README.md]]
 * @packageDocumentation
 */

import state from 'core/component/state';
import adapter from 'core/abt/engines';

import { emitter } from 'core/abt/const';
import { ExperimentsSet } from 'core/abt/interface';

export * from 'core/abt/const';
export * from 'core/abt/interface';

/**
 * Saves the specified ABT options
 *
 * @param opts
 * @emits `set(config:` [[ExperimentsSet]]`)`
 * @emits `clear(config:` [[ExperimentsSet]]`)`
 */
export default async function saveABT(opts: unknown): Promise<void> {
	let
		config = <CanPromise<ExperimentsSet | void>>adapter(opts);

	if (Object.isPromise(config)) {
		config = await config.catch(stderr);
	}

	if (Object.isArray(config)) {
		if (!Object.fastCompare(state.experiments, config)) {
			state.experiments = config;
			emitter.emit('set', config);
		}

	} else {
		state.experiments = [];
		emitter.emit('clear', config);
	}
}
