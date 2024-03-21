/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { State } from 'core/component';

export interface DependencyFn {
	(params: State): Promise<void>;
}

export interface Dependency {
	fn: DependencyFn;
	wait: Set<string>;
}
