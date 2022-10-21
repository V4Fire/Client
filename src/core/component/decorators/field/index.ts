/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/decorators/field/README.md]]
 * @packageDocumentation
 */

import { paramsFactory } from 'core/component/decorators/factory';
import type { InitFieldFn, DecoratorField } from 'core/component/decorators/interface';

/**
 * Marks a class property as a component field.
 * In non-functional components, field property mutations typically cause the component to re-render.
 *
 * @decorator
 *
 * @example
 * ```typescript
 * import iBlock, { component, field } from 'components/super/i-block/i-block';
 *
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
