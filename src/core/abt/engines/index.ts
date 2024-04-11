/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Experiments } from 'core/abt/interface';
import type { State } from 'core/component';

/**
 * Provides a set of abt options
 *
 * @param _opts - experiments options
 * @param _remoteState - remote state
 */
export default function abtAdapter(_opts: unknown, _remoteState: State): CanPromise<Experiments> {
	return [];
}
