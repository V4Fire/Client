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

import { ImageLoader } from 'core/dom/image';

import { ComponentDriver, VNode } from 'core/component/engines';
import { DirectiveOptions } from 'core/component/directives/image/interface';

export * from 'core/dom/image';

ComponentDriver.directive('image', {
	inserted(el: HTMLElement, {value}: DirectiveOptions, vNode: VNode): void {
		if (value == null) {
			return;
		}

		if (vNode.fakeContext != null) {
			if (Object.isPlainObject(value)) {
				value.ctx = value.ctx ?? vNode.fakeContext;

			} else {
				value = {
					src: value,
					ctx: vNode.fakeContext
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
