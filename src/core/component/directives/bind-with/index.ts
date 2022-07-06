/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/directives/bind-with/README.md]]
 * @packageDocumentation
 */

import { ComponentEngine, VNode } from 'core/component/engines';
import { getDirectiveContext } from 'core/component/directives/helpers';

import { idsCache } from 'core/component/directives/bind-with/const';
import { bindListenerToElement, clearElementBindings } from 'core/component/directives/bind-with/helpers';
import type { DirectiveParams } from 'core/component/directives/bind-with/interface';

export * from 'core/component/directives/bind-with/const';
export * from 'core/component/directives/bind-with/helpers';
export * from 'core/component/directives/bind-with/interface';

ComponentEngine.directive('bind-with', {
	mounted(el: Element, params: DirectiveParams, vnode: VNode): void {
		bindListenerToElement(params.value, el, getDirectiveContext(params, vnode));
	},

	updated(el: Element, params: DirectiveParams, vnode: VNode): void {
		const
			ctx = getDirectiveContext(params, vnode);

		if (ctx == null || ctx.meta.params.functional !== true && Object.fastCompare(params.value, params.oldValue)) {
			return;
		}

		bindListenerToElement(params.value, el, ctx);
	},

	unmounted(el: Element, params: DirectiveParams, vnode: VNode): void {
		clearElementBindings(el, getDirectiveContext(params, vnode));
		idsCache.delete(el);
	}
});
