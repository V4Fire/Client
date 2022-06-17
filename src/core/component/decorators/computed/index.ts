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
 * @component()
 * class bExample extends iBlock {
 *   @computed({cache: true})
 *   get foo() {
 *     return 42;
 *   }
 * }
 * ```
 */
export const computed = paramsFactory<DecoratorComponentAccessor>(null);
