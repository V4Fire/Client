/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/decorators/hook/README.md]]
 * @packageDocumentation
 */

import { paramsFactory } from 'core/component/decorators/factory';
import type { DecoratorHook } from 'core/component/decorators/interface';

/**
 * Attaches a hook listener to a component method.
 * This means that when the component switches to the specified hook(s), the method will be called.
 *
 * @decorator
 *
 * @example
 * ```typescript
 * import iBlock, { component, hook } from 'super/i-block/i-block';
 *
 * @component()
 * class bExample extends iBlock {
 *   @hook('mounted')
 *   onMounted() {
 *
 *   }
 * }
 * ```
 */
export const hook = paramsFactory<DecoratorHook>(null, (hook) => ({hook}));
