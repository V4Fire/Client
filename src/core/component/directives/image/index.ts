/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import ImageLoader from 'core/component/directives/image/image';

import { ComponentDriver, VNode } from 'core/component/engines';
import { DirectiveOptions } from 'core/component/directives/image/interface';

export * from 'core/component/directives/image/interface';

const ImageLoaderInstance = new ImageLoader();
export { ImageLoaderInstance as ImageLoader };

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

		ImageLoaderInstance.init(el, value);
	},

	update(el: HTMLElement, {value, oldValue}: DirectiveOptions): void {
		ImageLoaderInstance.update(el, value, oldValue);
	},

	unbind(el: HTMLElement): void {
		ImageLoaderInstance.clearElement(el);
	}
});
