/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/directives/aria/README.md]]
 * @packageDocumentation
 */

import { ComponentEngine, VNode, VNodeDirective } from 'core/component/engines';
import AriaSetter from 'core/component/directives/aria/aria-setter';

const
	ariaMap = new WeakMap();

ComponentEngine.directive('aria', {
	inserted(el: HTMLElement, binding: VNodeDirective, vnode: VNode): void {
		const
			{value, arg, modifiers} = binding;

		if (value == null && arg == null && modifiers == null) {
			return;
		}

		const
			aria = new AriaSetter({el, binding, vnode});

		ariaMap.set(el, aria);
	},

	update(el: HTMLElement) {
		const
			aria: AriaSetter = ariaMap.get(el);

		aria.update();
	},

	unbind(el: HTMLElement) {
		const
			aria: AriaSetter = ariaMap.get(el);

		aria.destroy();
	}
});
