/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/directives/async/target/README.md]]
 * @packageDocumentation
 */

import { ComponentEngine, VNode, DirectiveBinding } from 'core/component/engines';
import type { ComponentInterface } from 'core/component/interface';

export * from 'core/component/directives/async/async/interface';

ComponentEngine.directive('async-target', {
	beforeCreate(opts: DirectiveBinding, vnode: VNode): void {
		const ctx = Object.cast<ComponentInterface['unsafe']>(opts.instance);
		ctx.$emit('[[V_ASYNC_TARGET]]', vnode);
	}
});
