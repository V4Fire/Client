/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/directives/async-target/README.md]]
 * @packageDocumentation
 */

import { ComponentEngine, VNode } from 'core/component/engines';

import { getDirectiveContext } from 'core/component/directives/helpers';
import type { DirectiveParams } from 'core/component/directives/async-target/interface';

export * from 'core/component/directives/async-target/interface';

ComponentEngine.directive('async-target', {
	beforeCreate(params: DirectiveParams, vnode: VNode): void {
		const ctx = getDirectiveContext(params, vnode);

		if (ctx == null || params.value === false) {
			return;
		}

		ctx.$emit('[[V_ASYNC_TARGET]]', vnode);
	}
});
