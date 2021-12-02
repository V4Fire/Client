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

import IntersectionObserverStrategy from '~/core/dom/in-view/intersection';
import InViewAdapter from '~/core/dom/in-view/adapter';

import { getAdaptee } from '~/core/dom/in-view/helpers';

import MutationObserverStrategy from '~/core/dom/in-view/mutation';
import type { InViewAdapteeType } from '~/core/dom/in-view/interface';

export { default as InViewAdapter } from '~/core/dom/in-view/adapter';
export * from '~/core/dom/in-view/interface';
export * from '~/core/dom/in-view/helpers';

export const Adaptee = getAdaptee([
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
export function inViewFactory(adaptee?: InViewAdapteeType): InViewAdapter {
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
