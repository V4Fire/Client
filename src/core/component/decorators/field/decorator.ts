/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { PartDecorator } from 'core/component/decorators/interface';

import { system } from 'core/component/decorators/system';
import type { InitFieldFn, DecoratorField } from 'core/component/decorators/field/interface';

/**
 * Marks a class property as a component field.
 * In non-functional components, field property mutations typically cause the component to re-render.
 *
 * @decorator
 * @param [initOrParams] - a function to initialize the field value or an object with field parameters
 * @param [initOrDefault] - a function to initialize the field value or the field default value
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
export function field(
	initOrParams?: InitFieldFn | DecoratorField,
	initOrDefault?: InitFieldFn | DecoratorField['default']
): PartDecorator {
	return system(initOrParams, initOrDefault, 'fields');
}
