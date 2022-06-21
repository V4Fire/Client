/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/decorators/computed/README.md]]
 * @packageDocumentation
 */

import { paramsFactory } from 'core/component/decorators/factory';
import type { DecoratorComponentAccessor } from 'core/component/decorators/interface';

/**
 * Attaches meta information to a component computed field or accessor
 *
 * @decorator
 *
 * @example
 * ```typescript
 * import iBlock, { component, computed } from 'super/i-block/i-block';
 *
 * @component()
 * class bExample extends iBlock {
 *   @computed({cache: true})
 *   get hashCode(): number {
 *     return Math.random();
 *   }
 * }
 * ```
 */
export const computed = paramsFactory<DecoratorComponentAccessor>(null);
