/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { InitAppParams } from 'core/init/interface';

export interface DependencyFn {
	(params: InitAppParams): Promise<void>;
}

export interface Dependency {
	fn: DependencyFn;
	wait: Set<string>;
}
