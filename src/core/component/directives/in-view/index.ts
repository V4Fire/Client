/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import InViewAdapter from 'core/component/directives/in-view/adapter';

import { getAdaptee } from 'core/component/directives/in-view/helpers';
import { ComponentDriver } from 'core/component/engines';

import MutationObserverStrategy from 'core/component/directives/in-view/mutation';
import IntersectionObserverStrategy from 'core/component/directives/in-view/intersection';
import { DirectiveOptions, InitOptions } from 'core/component/directives/in-view/interface';

export { default as InViewAdapter } from 'core/component/directives/in-view/adapter';
export * from 'core/component/directives/in-view/interface';
export * from 'core/component/directives/in-view/helpers';

const Adaptee = getAdaptee([
	IntersectionObserverStrategy,
	MutationObserverStrategy
]);

/**
 * Creates a new in-view instance
 */
export function inViewFactory(): InViewAdapter {
	const inView = new InViewAdapter();

	if (!inView.hasAdaptee) {
		// @ts-ignore
		inView.setInstance(new Adaptee());
	}

	return inView;
}

export let
	InView: InViewAdapter = inViewFactory();

ComponentDriver.directive('in-view', {
	inserted(el: Element, {value}: DirectiveOptions): void {
		if (!Adaptee || !value) {
			return;
		}

		InView.observe(el, <CanArray<InitOptions>>value);
	},

	unbind(el: Element): void {
		InView.stopObserve(el);
		InView.remove(el);
	}
});
