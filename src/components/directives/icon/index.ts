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

import { ComponentEngine, VNode } from 'core/component/engines';

import { getDirectiveContext } from 'core/component/directives';
import { bindListenerToElement, clearElementBindings } from 'components/directives/bind-with/helpers';

import { idsCache } from 'components/directives/icon/const';
import { getIconHref, updateIconHref } from 'components/directives/icon/helpers';

import type { DirectiveParams } from 'components/directives/icon/interface';

export * from 'components/directives/icon/interface';

ComponentEngine.directive('icon', {
	beforeCreate(_: DirectiveParams, vnode: VNode): void {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		vnode.type = require('components/directives/icon/compiler-info').tag;
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
	},

	getSSRProps(params: DirectiveParams): Dictionary {
		const href = SyncPromise.resolve(getIconHref(params.value ?? params.arg)).unwrap();
		return {innerHTML: `<use href="${href}" />`};
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
