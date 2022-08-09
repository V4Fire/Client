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

export * from 'core/component/directives/aria/interface';

const
	ariaInstances = new WeakMap<Element, AriaSetter>();

ComponentEngine.directive('aria', {
	inserted(el: HTMLElement, binding: VNodeDirective, vnode: VNode): void {
		const
			{value, arg, modifiers} = binding;

		if (value == null && arg == null && modifiers == null) {
			return;
		}

		ariaInstances.set(el, new AriaSetter({el, binding, vnode}));
	},

	update(el: HTMLElement) {
		ariaInstances.get(el)?.update();
	},

	unbind(el: HTMLElement) {
		ariaInstances.get(el)?.destroy();
	}
});
