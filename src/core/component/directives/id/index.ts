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
			ctx = Object.cast<iBlock['unsafe']>(vnode.fakeContext);

		if (el.hasAttribute('id') && binding.modifiers?.preserve != null) {
			el.setAttribute('data-v-id-preserve', 'true');
			return;
		}

		el.setAttribute('id', ctx.dom.getId(binding.value));
	},

	update(el: HTMLElement, binding: VNodeDirective, vnode: VNode) {
		const
			ctx = Object.cast<iBlock['unsafe']>(vnode.fakeContext);

		if (el.hasAttribute('data-v-id-preserve')) {
			return;
		}

		el.setAttribute('id', ctx.dom.getId(binding.value));
	},

	unbind(el: HTMLElement) {
		el.removeAttribute('data-v-id-preserve');
	}
});
