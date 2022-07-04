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

import { idsCache } from 'core/component/directives/bind-with/const';
import { bindListenerToElement, clearElementBindings } from 'core/component/directives/bind-with/helpers';

import type { DirectiveOptions } from 'core/component/directives/bind-with/interface';

export * from 'core/component/directives/bind-with/const';
export * from 'core/component/directives/bind-with/helpers';
export * from 'core/component/directives/bind-with/interface';

ComponentEngine.directive('bind-with', {
	mounted(el: Element, {value}: DirectiveOptions, {virtualContext}: VNode): void {
		bindListenerToElement(value, el, virtualContext);
	},

	updated(el: Element, {value, oldValue}: DirectiveOptions, {virtualContext}: VNode): void {
		const
			ctx = virtualContext?.unsafe;

		if (ctx == null || ctx.meta.params.functional !== true && Object.fastCompare(value, oldValue)) {
			return;
		}

		bindListenerToElement(value, el, ctx);
	},

	unmounted(el: Element, opts: DirectiveOptions, {virtualContext}: VNode): void {
		clearElementBindings(el, virtualContext);
		idsCache.delete(el);
	}
});
