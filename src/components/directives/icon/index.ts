/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/directives/icon/README.md]]
 * @packageDocumentation
 */

import { ComponentEngine, VNode } from 'core/component/engines';

import { getDirectiveContext } from 'core/component/directives/helpers';
import { bindListenerToElement, clearElementBindings } from 'components/directives/bind-with/helpers';

import { idsCache } from 'components/directives/icon/const';
import { getIconHref, updateIconHref } from 'components/directives/icon/helpers';

import type { DirectiveParams } from 'components/directives/icon/interface';

export * from 'components/directives/icon/interface';

ComponentEngine.directive('icon', {
	beforeCreate(params: DirectiveParams, vnode: VNode): void {
		vnode.type = 'svg';
	},

	mounted(el: Element, params: DirectiveParams, vnode: VNode): void {
		setIcon(el, params, vnode);
	},

	beforeUpdate(el: Element, params: DirectiveParams, vnode: VNode): void {
		const
			ctx = getDirectiveContext(params, vnode);

		if (ctx == null || ctx.meta.params.functional !== true && params.value === params.oldValue) {
			return;
		}

		setIcon(el, params, vnode);
	},

	unmounted(el: Element, params: DirectiveParams, vnode: VNode): void {
		clearElementBindings(el, getDirectiveContext(params, vnode));
		idsCache.delete(el);
	}
});

function setIcon(el: Element, params: DirectiveParams, vnode: VNode): void {
	const
		ctx = getDirectiveContext(params, vnode);

	if (ctx == null) {
		return;
	}

	params.value = params.arg;

	const bind = {
		promise: getIconHref(params.arg),
		then: updateIconHref.bind(ctx),
		catch: (err) => {
			stderr(err);
			updateIconHref.call(ctx);
		}
	};

	bindListenerToElement(bind, el, getDirectiveContext(params, vnode));
}
