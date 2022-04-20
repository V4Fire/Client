/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { DirectiveBinding, DirectiveHook } from 'core/component/engines';

export interface DirectiveOptions extends DirectiveBinding<CanUndef<DirectiveValue>> {}

export interface DirectiveValue {
	created?: DirectiveHook;
	beforeMount?: DirectiveHook;
	mounted?: DirectiveHook;
	beforeUpdate?: DirectiveHook;
	updated?: DirectiveHook;
	beforeUnmount?: DirectiveHook;
	unmounted?: DirectiveHook;
}
