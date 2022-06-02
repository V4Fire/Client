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

import { InView, Adaptee, InViewDirectiveOptions } from 'core/dom/in-view';
import { ComponentEngine } from 'core/component/engines';

export * from 'core/component/directives/in-view/interface';

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
