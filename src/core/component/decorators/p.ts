/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { paramsFactory } from 'core/component/decorators/factory';
import type { DecoratorProp, DecoratorField, DecoratorMethod, DecoratorComponentAccessor } from 'core/component/decorators/interface';

/**
 * The universal decorator for a component property/accessor/method
 *
 * @decorator
 *
 * @example
 * ```typescript
 * @component()
 * class bExample extends iBlock {
 *   @p({cache: true})
 *   get foo() {
 *     return 42;
 *   }
 * }
 * ```
 */
export const p = paramsFactory<
	DecoratorProp |
	DecoratorField |
	DecoratorMethod |
	DecoratorComponentAccessor
>(null);

