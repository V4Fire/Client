/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Resize from 'core/component/directives/resize/resize';

import { ComponentDriver } from 'core/component/engines';
import { DirectiveOptions, DirectiveOptionsValue } from 'core/component/directives/resize/interface';

let ResizeInstance: Resize;

export { ResizeInstance as Resize };

ComponentDriver.directive('resize', {
	inserted(el: HTMLElement, options: DirectiveOptions): void {
		const params = buildParams(options);

		if (!params) {
			return;
		}

		if (!ResizeInstance) {
			ResizeInstance = new Resize();
		}

		ResizeInstance.observe(el, params);
	},

	update(el: HTMLElement, options: DirectiveOptions): void {
		const
			oldParams = buildParams(options),
			newParams = buildParams(options);

		if (Object.fastCompare(oldParams, newParams)) {
			return;
		}

		ResizeInstance.delete(el);

		if (newParams) {
			ResizeInstance.observe(el, newParams);
		}
	},

	unbind(el: HTMLElement): void {
		ResizeInstance.delete(el);
	}
});

/**
 * Returns a directive options
 * @param options
 */
function buildParams({value, modifiers}: DirectiveOptions): CanUndef<DirectiveOptionsValue> {
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

	const params: DirectiveOptionsValue = {
		watchWidth: isNoMods || modifiers.width,
		watchHeight: isNoMods || modifiers.height,
		...valueDict
	};

	return params;
}
