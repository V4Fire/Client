/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/directives/hook/README.md]]
 * @packageDocumentation
 */

import { ComponentEngine, VNode } from 'core/component/engines';
import type { DirectiveParams } from 'core/component/directives/tag/interface';

export * from 'core/component/directives/tag/interface';

ComponentEngine.directive('tag', {
	beforeCreate(params: DirectiveParams, vnode: VNode): void {
		vnode.type = params.value ?? vnode.type;
	}
});
