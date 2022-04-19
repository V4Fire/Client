/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { paramsFactory } from 'core/component/decorators/factory';
import type { InitFieldFn, DecoratorField } from 'core/component/decorators/interface';

/**
 * Marks a class property as a component field.
 * In regular components, mutations of field properties force component re-rendering.
 *
 * @decorator
 *
 * @example
 * ```typescript
 * @component()
 * class bExample extends iBlock {
 *   @field()
 *   bla: number = 0;
 *
 *   @field(() => Math.random())
 *   baz?: number;
 * }
 * ```
 */
export const field = paramsFactory<InitFieldFn | DecoratorField>('fields', (p) => {
	if (Object.isFunction(p)) {
		return {init: p};
	}

	return p;
});
