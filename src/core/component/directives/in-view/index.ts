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

export * from 'core/component/directives/in-view/interface';
export * from 'core/component/directives/in-view/helpers';

const Adaptee = getAdaptee([
	IntersectionObserverStrategy,
	MutationObserverStrategy
]);

export let
	InView: InViewAdapter = new InViewAdapter();

ComponentDriver.directive('in-view', {
	inserted(el: HTMLElement, {value}: DirectiveOptions): void {
		if (!Adaptee || !value) {
			return;
		}

		if (!InView.hasAdaptee) {
			// @ts-ignore
			InView.setInstance(new Adaptee());
		}

		if (Object.isFunction(value)) {
			value = <InitOptions>{
				callback: value
			};
		}

		InView.observe(el, <CanArray<InitOptions>>value);
	},

	unbind(el: HTMLElement): void {
		InView.stopObserve(el);
		InView.remove(el);
	}
});
