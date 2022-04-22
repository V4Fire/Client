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
import type { DirectiveOptions } from 'core/component/directives/tag/interface';

export * from 'core/component/directives/tag/interface';

ComponentEngine.directive('tag', {
	beforeCreate(opts: DirectiveOptions, vnode: VNode) {
		vnode.type = opts.value ?? vnode.type;
	}
});
