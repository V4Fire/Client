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

import iBlock from 'super/i-block/i-block';
import { ImageLoader } from 'core/dom/image';

import { ComponentDriver, VNode } from 'core/component/engines';
import { DirectiveOptions } from 'core/dom/image/interface';

export * from 'core/dom/image';

ComponentDriver.directive('image', {
	// @ts-expect-error (wrong type)
	inserted(el: HTMLElement, {value}: DirectiveOptions, vNode: VNode & {context?: iBlock}): void {
		if (value == null) {
			return;
		}

		if (vNode.context != null) {
			if (Object.isPlainObject(value)) {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				value.ctx = value.ctx ?? vNode.context;

			} else {
				value = {
					src: value,
					ctx: vNode.context
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
