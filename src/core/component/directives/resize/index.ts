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
	inserted(el: HTMLElement, {value, modifiers}: DirectiveOptions): void {
		if (!value) {
			return;
		}

		if (!ResizeInstance) {
			ResizeInstance = new Resize();
		}

		const valueDict = Object.isFunction(value) ? {
			callback: value
		} : value;

		const
			isNoMods = Object.keys(modifiers).length === 0;

		const params: DirectiveOptionsValue = {
			watchWidth: isNoMods || modifiers.width,
			watchHeight: isNoMods || modifiers.height,
			...valueDict
		};

		if (!params.callback) {
			return;
		}

		ResizeInstance.observe(el, <DirectiveOptionsValue>params);
	},

	unbind(el: HTMLElement): void {
		ResizeInstance.delete(el);
	}
});
