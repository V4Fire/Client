/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import ImageLoader from 'core/component/directives/image/image';

import { ComponentDriver } from 'core/component/engines';
import { DirectiveOptions } from 'core/component/directives/image/interface';

export * from 'core/component/directives/image/interface';

let
	ImageLoaderInstance: ImageLoader;

export { ImageLoaderInstance as ImageLoader };

ComponentDriver.directive('resize', {
	inserted(el: HTMLElement, {value}: DirectiveOptions): void {
		if (!value) {
			return;
		}

		if (!ImageLoaderInstance) {
			ImageLoaderInstance = new ImageLoader();
		}

		ImageLoaderInstance.load(el, value);
	},

	update(el: HTMLElement, {value, oldValue}: DirectiveOptions): void {
		value = value && ImageLoaderInstance.normalizeOptions(value);
		oldValue = oldValue && ImageLoaderInstance.normalizeOptions(oldValue);

		if (Object.fastCompare(value, oldValue)) {
			return;
		}

		ImageLoaderInstance.removePending(el);

		if (value) {
			ImageLoaderInstance.load(el, value);
		}
	},

	unbind(el: HTMLElement): void {
		ImageLoaderInstance.removePending(el);
	}
});
