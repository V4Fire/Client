/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { paramsFactory } from 'core/component/decorators/factory';
import type { DecoratorHook } from 'core/component/decorators/interface';

/**
 * Attaches a hook listener to a component method.
 * It means, that when a component is switched to the specified hook/s, the method will be invoked.
 *
 * @decorator
 * @example
 * ```typescript
 * @component()
 * class Foo extends iBlock {
 *   @hook('mounted')
 *   onMounted() {
 *
 *   }
 * }
 * ```
 */
export const hook = paramsFactory<DecoratorHook>(null, (hook) => ({hook}));
