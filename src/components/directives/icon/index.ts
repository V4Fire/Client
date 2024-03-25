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

import SyncPromise from 'core/promise/sync';

import { setVNodePatchFlags } from 'core/component/render';
import { ComponentEngine, VNode } from 'core/component/engines';

import { getDirectiveContext } from 'core/component/directives/helpers';
import { bindListenerToElement, clearElementBindings } from 'components/directives/bind-with/helpers';

import { idsCache } from 'components/directives/icon/const';
import { getIconHref, updateIconHref } from 'components/directives/icon/helpers';

import type { DirectiveParams } from 'components/directives/icon/interface';

export * from 'components/directives/icon/interface';

ComponentEngine.directive('icon', {
	beforeCreate(params: DirectiveParams, vnode: VNode): void {

		if (vnode.type !== 'svg') {
			throw new TypeError('The `v-icon` directive can be applied only to `svg`');
		}

		vnode.type = 'svg';

		if (SSR) {
			const
				ctx = getDirectiveContext(params, vnode);

			if (ctx == null) {
				return;
			}

			const
				{r} = ctx.$renderEngine;

			vnode.children = [
				r.createVNode.call(ctx, 'use', {
					href: SyncPromise.resolve(getIconHref(params.value ?? params.arg)).unwrap()
				})
			];

			vnode.dynamicChildren = Object.cast(vnode.children.slice());
			setVNodePatchFlags(vnode, 'children');
		}
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

	params.value ??= params.arg;

	const bind = {
		promise: getIconHref(params.value),
		then: updateIconHref.bind(ctx, params.value),
		catch: (el: Element, err: Error) => {
			stderr(err);
			updateIconHref.call(ctx, params.value, el);
		}
	};

	bindListenerToElement(bind, el, getDirectiveContext(params, vnode));
}
