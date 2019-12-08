/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Resize from 'core/component/directives/resize/resize';

import { ComponentDriver } from 'core/component/engines';
import { DirectiveOptions, ObserverOptions } from 'core/component/directives/resize/interface';

let ResizeInstance: Resize;

export { ResizeInstance as Resize };

ComponentDriver.directive('resize', {
	inserted(el: HTMLElement, opts: DirectiveOptions): void {
		const
			p = getOpts(opts);

		if (!p) {
			return;
		}

		if (!ResizeInstance) {
			ResizeInstance = new Resize();
		}

		ResizeInstance.observe(el, p);
	},

	update(el: HTMLElement, opts: DirectiveOptions): void {
		const
			oldParams = getOpts(opts),
			newParams = getOpts(opts);

		if (Object.fastCompare(oldParams, newParams)) {
			return;
		}

		ResizeInstance.unobserve(el);

		if (newParams) {
			ResizeInstance.observe(el, newParams);
		}
	},

	unbind(el: HTMLElement): void {
		ResizeInstance.unobserve(el);
	}
});

/**
 * Returns a directive options
 * @param options
 */
function getOpts({value, modifiers}: DirectiveOptions): CanUndef<ObserverOptions> {
	if (!value) {
		return;
	}

	const valueDict = Object.isFunction(value) ? {
		callback: value
	} : value ;

	if (!valueDict.callback) {
		return;
	}

	const
		isNoMods = Object.keys(modifiers).length === 0;

	return {
		watchWidth: isNoMods || modifiers.width,
		watchHeight: isNoMods || modifiers.height,
		...valueDict
	};
}
