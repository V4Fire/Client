/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ExperimentsSet } from 'core/abt/interface';

/**
 * Provides a set of abt options
 * @param opts - experiments options
 */
export default function abtAdapter(opts: unknown): CanPromise<ExperimentsSet> {
	return [];
}
