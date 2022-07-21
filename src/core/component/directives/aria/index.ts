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

import symbolGenerator from 'core/symbol';
import { ComponentEngine, VNode, VNodeDirective } from 'core/component/engines';
import AriaSetter from 'core/component/directives/aria/aria-setter';

const
	ariaMap = new Map();

const
	$$ = symbolGenerator();

ComponentEngine.directive('aria', {
	inserted(el: HTMLElement, binding: VNodeDirective, vnode: VNode): void {
		const
			{value, arg, modifiers} = binding;

		if (value == null && arg == null && modifiers == null) {
			return;
		}

		const
			aria = new AriaSetter({el, binding, vnode});

		aria.init();

		ariaMap.set($$.aria, aria);
	},

	update(el: HTMLElement, binding: VNodeDirective, vnode: VNode) {
		const
			aria: AriaSetter = ariaMap.get($$.aria);

		aria.options = {el, binding, vnode};

		aria.update();
	},

	unbind(el: HTMLElement, binding: VNodeDirective, vnode: VNode) {
		const
			aria: AriaSetter = ariaMap.get($$.aria);

		aria.options = {el, binding, vnode};

		aria.clear();
	}
});
