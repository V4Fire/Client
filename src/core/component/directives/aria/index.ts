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
import AriaAdapter from 'core/component/directives/aria/adapter';

export * from 'core/component/directives/aria/interface';

const
	ariaInstances = new WeakMap<Element, AriaAdapter>();

ComponentEngine.directive('aria', {
	inserted(el: HTMLElement, binding: VNodeDirective, vnode: VNode): void {
		const
			{value, arg, modifiers} = binding;

		if (value == null && arg == null && modifiers == null) {
			return;
		}

		ariaInstances.set(el, new AriaAdapter({el, binding, vnode}));
	},

	unbind(el: HTMLElement) {
		ariaInstances.get(el)?.destroy();
	}
});
