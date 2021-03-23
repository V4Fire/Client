/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { VNode, ComponentDriver } from 'core/component/engines';

import engine from 'core/component/directives/update-on/engines';
import type { DirectiveOptions, DirectiveValue } from 'core/component/directives/update-on/interface';

export * from 'core/component/directives/update-on/const';
export * from 'core/component/directives/update-on/interface';

/**
 * Directive to manually update an element by using special events
 */
ComponentDriver.directive('update-on', {
	inserted(el: Element, {value}: DirectiveOptions, vnode: VNode): void {
		add(el, value, vnode);
	},

	update(el: Element, {value, oldValue}: DirectiveOptions, vnode: VNode): void {
		if (Object.fastCompare(value, oldValue)) {
			return;
		}

		add(el, value, vnode);
	},

	unbind(el: Element, opts: DirectiveOptions, vnode: VNode): void {
		const
			ctx = vnode.fakeContext;

		if (ctx != null) {
			engine.remove(el, ctx);
		}
	}
});

function add(el: Element, value: Nullable<CanArray<DirectiveValue>>, vnode: VNode): void {
	const
		ctx = vnode.fakeContext;

	if (ctx == null) {
		return;
	}

	engine.remove(el, ctx);

	if (value == null) {
		return;
	}

	Array.concat([], value).forEach((params) => {
		engine.add(el, params, <any>ctx);
	});
}
