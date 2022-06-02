/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { DirectiveBinding, DirectiveHook, ObjectDirective } from 'core/component/engines';

export interface DirectiveOptions extends DirectiveBinding<CanUndef<DirectiveValue>> {}

export type DirectiveValue = Overwrite<Omit<ObjectDirective, 'deep' | 'getSSRProps'>, {
	beforeCreate?: DirectiveHook;
}>;
