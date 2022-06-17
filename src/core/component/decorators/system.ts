/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { paramsFactory } from 'core/component/decorators/factory';
import type { InitFieldFn, DecoratorSystem } from 'core/component/decorators/interface';

/**
 * Marks a class property as a system field.
 * System property mutations never cause components to re-render.
 *
 * @decorator
 *
 * @example
 * ```typescript
 * @component()
 * class bExample extends iBlock {
 *   @system()
 *   bla: number = 0;
 *
 *   @system(() => Math.random())
 *   baz?: number;
 * }
 * ```
 */
export const system = paramsFactory<InitFieldFn | DecoratorSystem>('systemFields', (p) => {
	if (Object.isFunction(p)) {
		return {init: p};
	}

	return p;
});
