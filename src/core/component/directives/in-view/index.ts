/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/dom/in-view/README.md]]
 * @packageDocumentation
 */

import { ComponentDriver } from 'core/component/engines';
import { InView, Adaptee, DirectiveOptions } from 'core/dom/in-view';

export * from 'core/dom/in-view';

ComponentDriver.directive('in-view', {
	inserted(el: Element, {value}: DirectiveOptions): void {
		if (!Adaptee || !value) {
			return;
		}

		InView.observe(el, value);
	},

	unbind(el: Element): void {
		InView.remove(el);
	}
});
