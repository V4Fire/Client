/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/directives/id/README.md]]
 * @packageDocumentation
 */

import { ComponentEngine, VNode, VNodeDirective } from 'core/component/engines';
import type iBlock from 'super/i-block/i-block';

ComponentEngine.directive('id', {
	inserted(el: HTMLElement, binding: VNodeDirective, vnode: VNode): void {
		const
			ctx = Object.cast<iBlock['unsafe']>(vnode.fakeContext),
			{modifiers: mod} = binding;

		if (mod?.preserve != null && el.hasAttribute('id')) {
			return;
		}

		const
			id = ctx.dom.getId(binding.value);

		el.setAttribute('id', id);
	}
});
