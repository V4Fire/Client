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

import { ComponentEngine } from 'core/component/engines';
import { InView, Adaptee, InViewDirectiveOptions } from 'core/dom/in-view';

export * from 'core/dom/in-view';

ComponentEngine.directive('in-view', {
	mounted(el: Element, {value}: InViewDirectiveOptions): void {
		if (!Adaptee || !value) {
			return;
		}

		InView.observe(el, value);
	},

	unmounted(el: Element): void {
		InView.remove(el);
	}
});
