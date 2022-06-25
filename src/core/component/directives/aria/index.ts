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
import { setAriaLabel, setAriaRole, setAriaTabIndex } from 'core/component/directives/aria/helpers';

ComponentEngine.directive('aria', {
	inserted(el: Element, opts: VNodeDirective, vnode: VNode): void {
		const
			{value, arg, modifiers} = opts;

		if (value == null && arg == null && modifiers == null) {
			return;
		}

		const
			options = {el, opts, vnode};

		setAriaLabel(options);
		setAriaTabIndex(options);
		setAriaRole(options)?.init();
	},

	unbind(el: Element, opts: VNodeDirective, vnode: VNode) {
		const
			options = {el, opts, vnode};

		setAriaRole(options)?.clear();
	}
});
