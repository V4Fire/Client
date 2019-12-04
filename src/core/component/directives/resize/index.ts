/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import ResizeClass from 'core/component/directives/resize/resize';

import { ComponentDriver } from 'core/component/engines';
import { DirectiveOptions, DirectiveOptionsValue } from 'core/component/directives/resize/interface';

export let Resize: ResizeClass;

ComponentDriver.directive('resize', {
	inserted(el: HTMLElement, {value, modifiers}: DirectiveOptions): void {
		if (!value) {
			return;
		}

		if (!Resize) {
			Resize = new ResizeClass();
		}

		const valueDict = Object.isFunction(value) ? {
			callback: value
		} : value;

		const params: DirectiveOptionsValue = {
			watchWidth: !modifiers || modifiers.width,
			watchHeight: !modifiers || modifiers.height,
			...valueDict
		};

		Resize.observe(el, <DirectiveOptionsValue>params);
	},

	unbind(el: HTMLElement): void {
		Resize.delete(el);
	}
});
