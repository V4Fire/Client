/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/decorators/system/README.md]]
 * @packageDocumentation
 */

import { paramsFactory } from 'core/component/decorators/factory';
import type { InitFieldFn, DecoratorSystem } from 'core/component/decorators/interface';

/**
 * Marks a class property as a system field.
 * System field mutations never cause components to re-render.
 *
 * @decorator
 *
 * @example
 * ```typescript
 * import iBlock, { component, system } from 'super/i-block/i-block';
 *
 * @component()
 * class bExample extends iBlock {
 *   @system()
 *   bla: number = 0;
 *
 *   @system(() => Math.random())
 *   baz!: number;
 * }
 * ```
 */
export const system = paramsFactory<InitFieldFn | DecoratorSystem>('systemFields', (p) => {
	if (Object.isFunction(p)) {
		return {init: p};
	}

	return p;
});
