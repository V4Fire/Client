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

import InViewAdapter from 'core/component/directives/in-view/adapter';

import { getAdaptee } from 'core/component/directives/in-view/helpers';
import { ComponentDriver } from 'core/component/engines';

import MutationObserverStrategy from 'core/component/directives/in-view/mutation';
import IntersectionObserverStrategy from 'core/component/directives/in-view/intersection';
import { DirectiveOptions, AdapteeType } from 'core/component/directives/in-view/interface';

export { default as InViewAdapter } from 'core/component/directives/in-view/adapter';
export * from 'core/component/directives/in-view/interface';
export * from 'core/component/directives/in-view/helpers';

const Adaptee = getAdaptee([
	IntersectionObserverStrategy,
	MutationObserverStrategy
]);

const strategyByType = {
	mutation: MutationObserverStrategy,
	observer: IntersectionObserverStrategy
};

/**
 * Creates a new in-view instance
 * @param [adaptee]
 */
export function inViewFactory(adaptee?: AdapteeType): InViewAdapter {
	const
		inView = new InViewAdapter(),
		adapteeInstance = adaptee != null ? new strategyByType[adaptee]() : new Adaptee!();

	if (!inView.hasAdaptee) {
		inView.setInstance(adapteeInstance);
	}

	return inView;
}

export const
	InView: InViewAdapter = inViewFactory();

if (!InView.hasAdaptee) {
	InView.setInstance(new Adaptee!());
}

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
