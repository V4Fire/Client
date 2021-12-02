/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/directives/image/README.md]]
 * @packageDocumentation
 */

import { ImageLoader } from '@src/core/dom/image';

import { ComponentEngine, VNode } from '@src/core/component/engines';
import type { DirectiveOptions } from '@src/core/component/directives/image/interface';

export * from '@src/core/dom/image';

ComponentEngine.directive('image', {
	inserted(el: HTMLElement, {value}: DirectiveOptions, vnode: VNode): void {
		if (value == null) {
			return;
		}

		if (vnode.fakeContext != null) {
			if (Object.isPlainObject(value)) {
				value.ctx = value.ctx ?? vnode.fakeContext;

			} else {
				value = {
					src: value,
					ctx: vnode.fakeContext
				};
			}
		}

		ImageLoader.init(el, value);
	},

	update(el: HTMLElement, {value, oldValue}: DirectiveOptions): void {
		ImageLoader.update(el, value, oldValue);
	},

	unbind(el: HTMLElement): void {
		ImageLoader.clearElement(el);
	}
});
