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

import { ComponentEngine } from 'core/component/engines';
import type { DirectiveOptions } from 'core/component/directives/image/interface';

export * from 'core/component/directives/image/interface';

ComponentEngine.directive('image', {
	mounted(el: HTMLElement, {value, instance}: DirectiveOptions): void {
		if (value == null) {
			return;
		}

		if (instance != null) {
			if (Object.isPlainObject(value)) {
				value.ctx = value.ctx ?? instance;

			} else {
				value = {
					src: value,
					ctx: instance
				};
			}
		}

		ImageLoader.init(el, value);
	},

	updated(el: HTMLElement, {value, oldValue}: DirectiveOptions): void {
		ImageLoader.update(el, value, oldValue ?? undefined);
	},

	unmounted(el: HTMLElement): void {
		ImageLoader.clearElement(el);
	}
});
