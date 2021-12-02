/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/directives/in-view/README.md]]
 * @packageDocumentation
 */

import { ComponentEngine } from '@src/core/component/engines';
import { InView, Adaptee, InViewDirectiveOptions } from '@src/core/dom/in-view';

export * from '@src/core/dom/in-view';

ComponentEngine.directive('in-view', {
	inserted(el: Element, {value}: InViewDirectiveOptions): void {
		if (!Adaptee || !value) {
			return;
		}

		InView.observe(el, value);
	},

	unbind(el: Element): void {
		InView.remove(el);
	}
});
