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

import type { State } from 'core/component/state';
import adapter from 'core/abt/engines';

import { emitter } from 'core/abt/const';
import type { Experiments } from 'core/abt/interface';

export * from 'core/abt/const';
export * from 'core/abt/interface';

/**
 * Saves the specified ABT options
 *
 * @param opts
 * @param remoteState
 * @emits `set(config:` [[ExperimentsSet]]`)`
 * @emits `clear(config:` [[ExperimentsSet]]`)`
 */
export default async function saveABT(opts: unknown, remoteState: State): Promise<void> {
	let
		config = <CanPromise<CanUndef<Experiments>>>adapter(opts, remoteState);

	if (Object.isPromise(config)) {
		try {
			config = await config;

		} catch (err) {
			stderr(err);
			config = undefined;
		}
	}

	if (Object.isArray(config)) {
		if (!Object.fastCompare(remoteState.experiments, config)) {
			remoteState.experiments = config;
			emitter.emit('set', config);
		}

	} else {
		remoteState.experiments = [];
		emitter.emit('clear', config);
	}
}
