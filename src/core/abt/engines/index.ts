/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ExperimentsSet } from '/core/abt/interface';

/**
 * Provides a set of abt options
 * @param opts - experiments options
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
export default function abtAdapter(opts: unknown): CanPromise<ExperimentsSet> {
	return [];
}
